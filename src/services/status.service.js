import Status from '../models/Status.js';
import Issue from '../models/Issue.js';
import { requireRole } from '../utils/permission.js';
import ApiError from '../utils/ApiError.js';

/* ===================== CREATE ===================== */
export const createStatusService = async ({ name, color, projectId }, userId) => {
  if (!name || !projectId) {
    throw new ApiError(400, 'Missing required fields');
  }

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  // order tự tăng
  const lastStatus = await Status.findOne({ project: projectId }).sort({ order: -1 });
  const nextOrder = lastStatus ? lastStatus.order + 1 : 0;

  const status = await Status.create({
    name,
    color: color || '#999',
    order: nextOrder,
    project: projectId,
  });

  return status;
};

/* ===================== GET ALL ===================== */
export const getStatusesService = async (projectId) => {
  const statuses = await Status.find({ project: projectId }).sort({ order: 1 });
  return statuses;
};

/* ===================== UPDATE ===================== */
export const updateStatusService = async (id, updates, userId) => {
  const status = await Status.findById(id);
  if (!status) throw new ApiError(404, 'Status not found');

  await requireRole(status.project, userId, ['Owner', 'Admin']);

  status.name = updates.name ?? status.name;
  status.color = updates.color ?? status.color;

  await status.save();
  return status;
};

/* ===================== REORDER ===================== */
export const reorderStatusService = async (projectId, statusOrders, userId) => {
  if (!projectId || !Array.isArray(statusOrders) || statusOrders.length === 0) {
    throw new ApiError(400, 'Invalid status orders');
  }

  /* ===== PERMISSION ===== */
  await requireRole(projectId, userId, ['Owner', 'Admin']);

  /* ===== VALIDATE ORDER DUPLICATE ===== */
  const orders = statusOrders.map((s) => s.order);
  const unique = new Set(orders);

  if (unique.size !== orders.length) {
    throw new ApiError(400, 'Duplicate order value');
  }

  /* ===== VALIDATE ORDER VALUE ===== */
  const invalidOrder = orders.some((o) => o < 0);
  if (invalidOrder) {
    throw new ApiError(400, 'Order must be >= 0');
  }

  /* ===== VALIDATE STATUS BELONG PROJECT ===== */
  const ids = statusOrders.map((s) => s.id);
  const statuses = await Status.find({ _id: { $in: ids }, project: projectId });

  if (statuses.length !== ids.length) {
    throw new ApiError(400, 'Some statuses do not belong to this project');
  }

  /* ===== BULK UPDATE ===== */
  const bulk = statusOrders.map((s) => ({
    updateOne: {
      filter: { _id: s.id, project: projectId },
      update: { order: s.order },
    },
  }));

  await Status.bulkWrite(bulk);

  return true;
};

/* ===================== DELETE ===================== */
export const deleteStatusService = async (id, projectId, moveToStatusId = null, userId) => {
  const status = await Status.findById(id);
  if (!status) throw new ApiError(404, 'Status not found');

  /* ===== PERMISSION ===== */
  await requireRole(projectId, userId, ['Owner', 'Admin']);

  const issues = await Issue.countDocuments({ status: id });

  if (issues > 0 && !moveToStatusId) {
    throw new ApiError(400, 'Status has issues. Provide moveToStatusId');
  }

  if (issues > 0 && moveToStatusId) {
    const target = await Status.findById(moveToStatusId);
    if (!target) throw new ApiError(404, 'Target status not found');

    if (target.project.toString() !== status.project.toString()) {
      throw new ApiError(400, 'Target status must be same project');
    }

    await Issue.updateMany({ status: id }, { status: moveToStatusId });
  }

  await Status.findByIdAndDelete(id);
  return true;
};
