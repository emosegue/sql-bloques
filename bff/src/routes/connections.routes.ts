import { Router } from 'express';
import ConnectionsController from '../controllers/connections.controller';
import DatabaseController from '../controllers/database.controller';

const router = Router();

router.get('/', ConnectionsController.getAllConnections);
router.post('/', ConnectionsController.createConnection);
router.post('/test', ConnectionsController.testConnection);
router.get('/:id', ConnectionsController.getConnection);
router.put('/:id', ConnectionsController.updateConnection);
router.delete('/:id', ConnectionsController.deleteConnection);
router.post('/schema', DatabaseController.getDatabaseSchema);
router.post('/execute', DatabaseController.executeQuery);

export default router;
