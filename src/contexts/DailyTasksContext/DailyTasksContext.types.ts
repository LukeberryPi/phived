import type { Dispatch, SetStateAction } from 'react'

export type DailyTask = string

export type DailyTasks = DailyTask[]

export type DailyTaskLastDoneAt = {
  dailyTask: string
  dateCompleted: Date
}

export type DailyTasksLastDoneAt = DailyTaskLastDoneAt[]

export type DailyTaskContextType = {
  changeDailyTask: (taskIndex: number, newValue: string) => void
  clearDailyTasks: () => void
  completeDailyTask: (taskIndex: number) => void
  dailyTasks: DailyTasks
  dailyTasksLastDoneAt: DailyTasksLastDoneAt
  displayDailyMessage: (incentive: string) => void
  moveTaskUp: (taskIndex: number) => void
  moveTaskDown: (taskIndex: number) => void
  dailyMessage: string
  setDailyTasks: Dispatch<SetStateAction<DailyTaskContextType['dailyTasks']>>
  setDailyTasksLastDoneAt: Dispatch<SetStateAction<DailyTaskContextType['dailyTasksLastDoneAt']>>
  setDailyMessage: Dispatch<SetStateAction<DailyTaskContextType['dailyMessage']>>
}
