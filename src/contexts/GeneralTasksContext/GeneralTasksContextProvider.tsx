import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { incentives } from 'src/content'
import { GeneralTasksContext } from 'src/contexts/GeneralTasksContext/GeneralTasksContext'
import type { GeneralTask } from 'src/contexts/GeneralTasksContext/GeneralTasksContext.types'
import { useLocalStorage } from 'src/hooks/useLocalStorage'

export const GeneralTasksContextProvider = ({ children }: PropsWithChildren) => {
  const [storedGeneralTasks, setStoredGeneralTasks] = useLocalStorage(
    'storedGeneralTasks',
    Array<string>(5).fill('')
  )
  const [generalTasks, setGeneralTasks] = useState(storedGeneralTasks)
  const [generalMessage, setGeneralMessage] = useState<string>('')
  const [timeoutId, setTimeoutId] = useState<undefined | NodeJS.Timeout>(undefined)

  const memoizedTasks = useMemo(() => generalTasks, [generalTasks])

  const getRandomIncentive = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  const generalIncentive = useMemo(
    () => getRandomIncentive(incentives),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generalTasks]
  )

  const displayGeneralMessage = useCallback(
    (generalMessage: string) => {
      setGeneralMessage(generalMessage)
      clearTimeout(timeoutId)
      const newTimeoutId = setTimeout(() => {
        setGeneralMessage('')
      }, 4000)

      setTimeoutId(newTimeoutId)
    },
    [timeoutId]
  )

  const changeGeneralTask = useCallback(
    (taskIndex: number, newValue: GeneralTask) => {
      const generalTaskCopy = [...generalTasks]
      generalTaskCopy[taskIndex] = newValue

      setGeneralTasks(generalTaskCopy)
    },
    [generalTasks, setGeneralTasks]
  )

  const completeGeneralTask = useCallback(
    (taskIndex: number) => {
      if (!generalTasks[taskIndex]) return

      const ongoingTasks = generalTasks.filter((_, idx) => idx !== taskIndex)
      setGeneralTasks([...ongoingTasks, ''])
      displayGeneralMessage(generalIncentive)
    },
    [displayGeneralMessage, generalIncentive, generalTasks, setGeneralTasks]
  )

  const clearGeneralTasks = useCallback(() => {
    const isUserCertain = window.confirm('Are you sure you want to DELETE all your tasks?')

    if (!isUserCertain) {
      return
    }

    setGeneralTasks(Array(5).fill(''))
    displayGeneralMessage('tasks cleared!')
  }, [displayGeneralMessage, setGeneralTasks])

  const moveTaskUp = useCallback(
    (taskIndex: number) => {
      const copy = [...generalTasks]
      const taskBefore = copy[taskIndex - 1]
      copy[taskIndex - 1] = copy[taskIndex]
      copy[taskIndex] = taskBefore

      setGeneralTasks(copy)
    },
    [generalTasks, setGeneralTasks]
  )

  const moveTaskDown = useCallback(
    (taskIndex: number) => {
      const copy = [...generalTasks]
      const taskAfter = copy[taskIndex + 1]
      copy[taskIndex + 1] = copy[taskIndex]
      copy[taskIndex] = taskAfter

      setGeneralTasks(copy)
    },
    [generalTasks, setGeneralTasks]
  )

  useEffect(() => {
    setStoredGeneralTasks(generalTasks)
  }, [generalTasks, setStoredGeneralTasks])

  return (
    <GeneralTasksContext.Provider
      value={{
        changeGeneralTask,
        clearGeneralTasks,
        completeGeneralTask,
        moveTaskUp,
        moveTaskDown,
        displayGeneralMessage,
        generalTasks: memoizedTasks,
        generalMessage,
        setGeneralTasks,
        setGeneralMessage,
      }}
    >
      {children}
    </GeneralTasksContext.Provider>
  )
}
