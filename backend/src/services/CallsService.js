import { CallRecord, Operator } from '../models/index.js';
import { Op } from 'sequelize';

class CallsService {
  async recordCall(data) {
    const {
      tenantId,
      operatorId,
      callSid,
      fromNumber,
      toNumber
    } = data;

    return CallRecord.create({
      tenant_id: tenantId,
      operator_id: operatorId,
      twilio_call_sid: callSid,
      from_number: fromNumber,
      to_number: toNumber,
      status: 'initiated',
      started_at: new Date()
    });
  }

  async updateCallEvent(callSid, data) {
    const callRecord = await CallRecord.findOne({
      where: { twilio_call_sid: callSid }
    });

    if (!callRecord) {
      throw new Error('Call record not found');
    }

    const {
      status,
      duration,
      price,
      recordingUrl
    } = data;

    callRecord.status = status;
    if (duration) {
      callRecord.duration_seconds = duration;
    }
    if (price) {
      callRecord.price_per_minute = price;
      callRecord.total_cost = (duration / 60) * price;
    }
    if (recordingUrl) {
      callRecord.recording_url = recordingUrl;
    }
    if (status === 'completed') {
      callRecord.ended_at = new Date();
    }

    return callRecord.save();
  }

  async getCallLogs(tenantId, filters = {}) {
    const where = { tenant_id: tenantId };

    if (filters.operatorId) {
      where.operator_id = filters.operatorId;
    }
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const calls = await CallRecord.findAll({
      where,
      include: [
        {
          model: Operator,
          attributes: ['id', 'name', 'twilio_number']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });

    const total = await CallRecord.count({ where });

    return { calls, total };
  }

  async getCallById(tenantId, callId) {
    return CallRecord.findOne({
      where: {
        id: callId,
        tenant_id: tenantId
      },
      include: [Operator]
    });
  }
}

export default new CallsService();
