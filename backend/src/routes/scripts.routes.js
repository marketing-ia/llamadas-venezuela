import express from 'express';
import ScriptsService from '../services/ScriptsService.js';

const router = express.Router();

// GET /api/scripts - List all scripts
router.get('/', async (req, res) => {
  try {
    const scripts = await ScriptsService.listScripts(req.tenantId);
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// POST /api/scripts - Create script
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const script = await ScriptsService.createScript(req.tenantId, { title, content });
    res.status(201).json(script);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scripts/:id - Get script by ID
router.get('/:id', async (req, res) => {
  try {
    const script = await ScriptsService.getScriptById(req.tenantId, req.params.id);
    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }
    res.json(script);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch script' });
  }
});

// PUT /api/scripts/:id - Update script
router.put('/:id', async (req, res) => {
  try {
    const script = await ScriptsService.updateScript(req.tenantId, req.params.id, req.body);
    res.json(script);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/scripts/:id - Delete script
router.delete('/:id', async (req, res) => {
  try {
    await ScriptsService.deleteScript(req.tenantId, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
