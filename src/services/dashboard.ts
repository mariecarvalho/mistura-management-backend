import pool from '../config/database';
import { getDonationTotals } from './donations';

export const getDashboardStats = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        -- Famílias (cada subquery isolada, sem JOIN cartesiano)
        (SELECT COUNT(*) FROM family WHERE benefit_status = 'Ativo')         AS families_active,
        (SELECT COUNT(*) FROM family WHERE benefit_status != 'Ativo')        AS families_inactive,
        (SELECT COUNT(*) FROM family WHERE children_count = 0)               AS families_without_children,
        (SELECT COUNT(*) FROM family WHERE has_elderly = true)               AS elderly_families,
        (SELECT COUNT(*) FROM family WHERE is_single_mother = true)          AS single_mothers,

        -- Ações
        (SELECT COUNT(*) FROM action WHERE status = 'completed')             AS actions_completed,
        (SELECT COALESCE(SUM(families_served), 0) FROM action
           WHERE status = 'completed')                                       AS total_families_served,

        -- Voluntários
        (SELECT COUNT(*) FROM volunteer WHERE is_active = true)              AS volunteers_active,
        (SELECT COUNT(*) FROM volunteer)                                     AS volunteers_total
    `);

    // Marmitas realizadas: soma de meals_taken das ações concluídas
    const mealsResult = await client.query(`
      SELECT COALESCE(SUM(fp.meals_taken), 0) AS total_meals_distributed
      FROM family_presence fp
      JOIN action a ON a.id = fp.action_id
      WHERE a.status = 'completed'
    `);

    const row = result.rows[0];

    // Marmitas por mês (últimos 6 meses) — calculadas das presenças reais
    const mealsByMonth = await client.query(`
      SELECT
        TO_CHAR(date_trunc('month', a.date), 'Mon/YY') AS month,
        date_trunc('month', a.date)                     AS month_sort,
        COUNT(DISTINCT fp.family_id)                    AS families_served,
        COALESCE(SUM(fp.meals_taken), 0)                AS meals_distributed
      FROM action a
      LEFT JOIN family_presence fp ON fp.action_id = a.id
      WHERE a.status = 'completed'
        AND a.date >= date_trunc('month', NOW()) - INTERVAL '5 months'
      GROUP BY date_trunc('month', a.date)
      ORDER BY date_trunc('month', a.date) ASC
    `);

    // Famílias atendidas por ação (últimas 10 ações concluídas) — calculadas das presenças
    const familiesByAction = await client.query(`
      SELECT
        a.title,
        COUNT(DISTINCT fp.family_id)     AS families_served,
        COALESCE(SUM(fp.meals_taken), 0) AS meals_distributed,
        TO_CHAR(a.date, 'DD/MM/YY')      AS date_label
      FROM action a
      LEFT JOIN family_presence fp ON fp.action_id = a.id
      WHERE a.status = 'completed'
      GROUP BY a.id, a.title, a.date
      ORDER BY a.date DESC
      LIMIT 10
    `);

    // Próximas ações planejadas
    const upcomingActions = await client.query(`
      SELECT id, title, date, status, families_served, volunteer_count
      FROM action
      WHERE status IN ('planned', 'in-progress')
      ORDER BY date ASC
      LIMIT 5
    `);

    // Últimas famílias cadastradas
    const recentFamilies = await client.query(`
      SELECT id, representative_name, people_count, benefit_status, created_at
      FROM family
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const donationTotals = await getDonationTotals();

    return {
      counters: {
        families_active:           Number(row.families_active),
        families_inactive:         Number(row.families_inactive),
        families_without_children: Number(row.families_without_children),
        actions_completed:         Number(row.actions_completed),
        total_families_served:     Number(row.total_families_served),
        total_meals_distributed:   Number(mealsResult.rows[0].total_meals_distributed),
        volunteers_active:         Number(row.volunteers_active),
        volunteers_total:          Number(row.volunteers_total),
        single_mothers:            Number(row.single_mothers),
        elderly_families:          Number(row.elderly_families),
        donations_received:        Number(donationTotals.total_received),
        donations_pending:         Number(donationTotals.total_pending),
        donations_count:           Number(donationTotals.total_count),
      },
      meals_by_month:     mealsByMonth.rows,
      families_by_action: familiesByAction.rows.reverse(),
      upcoming_actions:   upcomingActions.rows,
      recent_families:    recentFamilies.rows,
    };
  } finally {
    client.release();
  }
};
