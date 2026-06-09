import Foundation

extension TaskStore {
    /// Applies demo fixtures used by screenshot tooling when `PHIVED_SNAPSHOT_STATE` is set.
    /// Returns `true` when a snapshot state was requested, signalling that persistence should
    /// stay disabled so the fixtures never overwrite the user's real data.
    func seedSnapshotStateIfRequested() -> Bool {
        guard let state = ProcessInfo.processInfo.environment["PHIVED_SNAPSHOT_STATE"] else {
            return false
        }

        tasks = Self.emptyTasks()
        history = []
        theme = .system
        helpOpen = true
        historyOpen = true
        taskPanelWidth = Self.defaultPanelWidth

        switch state {
        case "populated":
            tasks = ["ship the native app", "compare every pixel", "", "", ""]
            history = [
                HistoryEntry(id: UUID(), text: "build the monorepo", completedAt: Date()),
                HistoryEntry(id: UUID(), text: "move the web app", completedAt: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
            ]
        case "dialog":
            tasks = ["ship the native app", "", "", "", ""]
            confirmation = .tasks
        case "light":
            theme = .light
        default:
            break
        }

        return true
    }
}
