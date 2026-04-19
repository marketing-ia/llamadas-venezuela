import express from 'express';
import { CallRecord, Operator } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/analytics/summary - Get overall statistics
router.get('/summary', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    const where = { tenant_id: tenantId };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Total calls
    const totalCalls = await CallRecord.count({ where });

    // Total cost
    const costData = await CallRecord.findAll({
      where,
      attributes: [
        [
          require('sequelize').fn('SUM', require('sequelize').col('total_cost')),
          'totalCost'
        ]
      ],
      raw: true
    });
    const totalCost = costData[0]?.totalCost || 0;

    // Total duration
    const durationData = await CallRecord.findAll({
      where,
      attributes: [
        [
          require('sequelize').fn('SUM', require('sequelize').col('duration_seconds')),
          'totalDuration'
        ]
      ],
      raw: true
    });
    const totalDuration = durationData[0]?.totalDuration || 0;

    // Call status breakdown
    const statusBreakdown = await CallRecord.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({
      totalCalls,
      totalCost,
      totalDuration,
      statusBreakdown
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/operator-stats - Get operator statistics
router.get('/operator-stats', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    const where = { tenant_id: tenantId };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const stats = await CallRecord.findAll({
      where,
      attributes: [
        'operator_id',
        [require('sequelize').fn('COUNT', '*'), 'callCount'],
        [
          require('sequelize').fn('SUM', require('sequelize').col('duration_seconds')),
          'totalDuration'
        ],
        [
          require('sequelize').fn('SUM', require('sequelize').col('total_cost')),
          'totalCost'
        ]
      ],
      include: [
        {
          model: Operator,
          attributes: ['id', 'name']
        }
      ],
      group: ['operator_id'],
      raw: true,
      subQuery: false
    });

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching operator stats:', error);
    res.status(500).json({ error: 'Failed to fetch operator stats' });
  }
});

// GET /api/analytics/daily - Get daily call statistics
router.get('/daily', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    const where = { tenant_id: tenantId };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const dailyStats = await CallRecord.findAll({
      where,
      attributes: [
        [
          require('sequelize').fn('DATE', require('sequelize').col('createdAt')),
          'date'
        ],
        [require('sequelize').fn('COUNT', '*'), 'callCount'],
        [
          require('sequelize').fn('SUM', require('sequelize').col('total_cost')),
          'totalCost'
        ]
      ],
      group: [
        require('sequelize').fn('DATE', require('sequelize').col('createdAt'))
      ],
      order: [
        [
          require('sequelize').fn('DATE', require('sequelize').col('createdAt')),
          'ASC'
        ]
      ],
      raw: true
    });

    res.json({ dailyStats });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

export default router;
