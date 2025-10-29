import overallData from "../../mockApiResponse/overall.json"
import byReviewerData from "../../mockApiResponse/by-reviewer.json"
import byTrainerLevelData from "../../mockApiResponse/by-trainer-level.json"
import taskLevelData from "../../mockApiResponse/task-level.json"

export const mockData = {
  overall: overallData,
  byReviewer: byReviewerData,
  byTrainerLevel: byTrainerLevelData,
  taskLevel: taskLevelData,
} as const
