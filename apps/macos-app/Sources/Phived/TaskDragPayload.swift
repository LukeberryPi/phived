import Foundation
import UniformTypeIdentifiers

struct TaskDragPayload: Codable, Equatable {
    static let contentType = UTType(exportedAs: "com.phived.task-row")

    let listId: UUID
    let index: Int

    func itemProvider() -> NSItemProvider {
        guard let data = try? JSONEncoder().encode(self) else {
            return NSItemProvider()
        }

        return NSItemProvider(item: data as NSData, typeIdentifier: Self.contentType.identifier)
    }

    static func load(from provider: NSItemProvider, completion: @escaping (TaskDragPayload?) -> Void) {
        provider.loadDataRepresentation(forTypeIdentifier: Self.contentType.identifier) { data, _ in
            guard let data,
                  let payload = try? JSONDecoder().decode(TaskDragPayload.self, from: data)
            else {
                completion(nil)
                return
            }

            completion(payload)
        }
    }
}
