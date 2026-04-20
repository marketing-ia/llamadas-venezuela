import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { CallRecord, Operator } from '../models/index.js';

const router = express.Router();

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    const where = { tenant_id: tenantId };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const totalCalls = await CallRecord.count({ where });

    const costData = await CallRecord.findAll({
      where,
      attributes: [[fn('SUM', col('total_cost')), 'totalCost']],
      raw: true
    });
    const totalCost = parseFloat(costData[0]?.totalCost) || 0;

    const durationData = await CallRecord.findAll({
      where,
      attributes: [[fn('SUM', col('duration_seconds')), 'totalDuration']],
      raw: true
    });
    const totalDuration = parseInt(durationData[0]?.totalDuration) || 0;

    const statusBreakdown = await CallRecord.findAll({
      where,
      attributes: ['status', [fn('COUNT', literal('*')), 'count']],
      group: ['status'],
      raw: true
    });

    res.json({ totalCalls, totalCost, totalDuration, statusBreakdown });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/operator-stats
router.get('/operator-stats', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    const where = { tenant_id: tenantId };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const stats = await CallRecord.findAll({
      where,
      attributes: [
        'operator_id',
        [fn('COUNT', literal('*')), 'callCount'],
        [fn('SUM', col('CallRecord.duration_seconds')), 'totalDuration'],
        [fn('SUM', col('CallRecord.total_cost')), 'totalCost']
      ],
      include: [{ model: Operator, attributes: ['id', 'name'] }],
      group: ['operator_id', 'Operator.id', 'Operator.name'],
      subQuery: false,
      raw: true
    });

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching operator stats:', error);
    res.status(500).json({ error: 'Failed to fetch operator stats' });
  }
});

// GET /api/analytics/daily
router.get('/daily', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    const where = { tenant_id: tenantId };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const dailyStats = await CallRecord.findAll({
      where,
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', literal('*')), 'callCount'],
        [fn('SUM', col('total_cost')), 'totalCost']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    res.json({ dailyStats });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

export default router;
