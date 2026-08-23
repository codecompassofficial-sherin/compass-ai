import type { Types } from "mongoose";
import type { FilterQuery } from "mongoose";
import type { JobDocument } from "./job.model.js";
import { JobModel } from "./job.model.js";

export const jobRepository = {
  async findById(id: Types.ObjectId): Promise<JobDocument | null> {
    return JobModel.findById(id);
  },

  async findBySourceAndId(source: string, sourceId: string): Promise<JobDocument | null> {
    return JobModel.findOne({ source, sourceId });
  },

  async upsertBySourceAndId(
    source: string,
    sourceId: string,
    update: Partial<JobDocument>,
  ): Promise<JobDocument> {
    const filter: FilterQuery<JobDocument> = { source, sourceId };
    return JobModel.findOneAndUpdate(filter, { $set: update }, {
      new: true,
      upsert: true,
      runValidators: true,
    });
  },

  async findActiveByNormalizedHash(normalizedHash: string): Promise<JobDocument | null> {
    return JobModel.findOne({ normalizedHash, isActive: true });
  },

  async findActiveJobs(
    filter: FilterQuery<JobDocument>,
    options: { page: number; limit: number },
  ): Promise<{ jobs: JobDocument[]; total: number }> {
    const skip = (options.page - 1) * options.limit;
    const [jobs, total] = await Promise.all([
      JobModel.find({ ...filter, isActive: true })
        .sort({ fetchedAt: -1 })
        .skip(skip)
        .limit(options.limit),
      JobModel.countDocuments({ ...filter, isActive: true }),
    ]);
    return { jobs, total };
  },
};
