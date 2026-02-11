import Status from '../models/Status.js';
import Issue from '../models/Issue.js';
import ApiError from '../utils/ApiError.js';

/* ===================== CREATE ===================== */
export const createStatusService = async ({ name, color, projectId }) => {
  if (!name || !projectId) {
    throw new ApiError(400, 'Missing required fields');
  }

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
export const updateStatusService = async (id, updates) => {
  const status = await Status.findById(id);
  if (!status) throw new ApiError(404, 'Status not found');

  status.name = updates.name ?? status.name;
  status.color = updates.color ?? status.color;

  await status.save();
  return status;
};

/* ===================== REORDER ===================== */
export const reorderStatusService = async (projectId, statusOrders) => {
  // statusOrders: [{ id, order }]
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
export const deleteStatusService = async (id, moveToStatusId = null) => {
  const status = await Status.findById(id);
  if (!status) throw new ApiError(404, 'Status not found');

  const issues = await Issue.countDocuments({ status: id });

  if (issues > 0 && !moveToStatusId) {
    throw new ApiError(400, 'Status has issues. Provide moveToStatusId');
  }

  if (issues > 0 && moveToStatusId) {
    await Issue.updateMany({ status: id }, { status: moveToStatusId });
  }

  await Status.findByIdAndDelete(id);
  return true;
};
