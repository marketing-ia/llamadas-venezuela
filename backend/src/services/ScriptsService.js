import { SalesScript } from '../models/index.js';

class ScriptsService {
  async createScript(tenantId, data) {
    const { title, content } = data;

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    return SalesScript.create({
      tenant_id: tenantId,
      title,
      content
    });
  }

  async updateScript(tenantId, scriptId, data) {
    const script = await SalesScript.findOne({
      where: { id: scriptId, tenant_id: tenantId }
    });

    if (!script) {
      throw new Error('Script not found');
    }

    if (data.title) script.title = data.title;
    if (data.content) script.content = data.content;

    return script.save();
  }

  async deleteScript(tenantId, scriptId) {
    const script = await SalesScript.findOne({
      where: { id: scriptId, tenant_id: tenantId }
    });

    if (!script) {
      throw new Error('Script not found');
    }

    await script.destroy();
    return { success: true };
  }

  async listScripts(tenantId) {
    return SalesScript.findAll({
      where: { tenant_id: tenantId },
      order: [['createdAt', 'DESC']]
    });
  }

  async getScriptById(tenantId, scriptId) {
    return SalesScript.findOne({
      where: { id: scriptId, tenant_id: tenantId }
    });
  }
}

export default new ScriptsService();
