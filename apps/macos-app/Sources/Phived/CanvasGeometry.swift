import CoreGraphics

enum CanvasGeometry {
    static let canvasWidth = 6000.0
    static let canvasHeight = 4000.0
    static let defaultListWidth = 340.0
    static let minimumListWidth = 260.0
    static let maximumListWidth = 620.0
    static let minimumZoom = 0.15
    static let maximumZoom = 2.0

    private static let listEdgeMargin = 16.0
    private static let listMinimumVisibleHeight = 360.0

    static func clampZoom(_ zoom: Double) -> Double {
        clamp(zoom, minimumZoom, maximumZoom)
    }

    static func clampListWidth(_ width: Double) -> Double {
        clamp(width, minimumListWidth, maximumListWidth)
    }

    static func clampListPosition(x: Double, y: Double, width: Double = defaultListWidth) -> CGPoint {
        CGPoint(
            x: clamp(x, listEdgeMargin, canvasWidth - width - listEdgeMargin),
            y: clamp(y, listEdgeMargin, canvasHeight - listMinimumVisibleHeight - listEdgeMargin)
        )
    }

    static func clampViewport(_ viewport: CanvasViewport, in viewSize: CGSize) -> CanvasViewport {
        let zoom = clampZoom(viewport.zoom)
        let scaledWidth = canvasWidth * zoom
        let scaledHeight = canvasHeight * zoom

        return CanvasViewport(
            x: scaledWidth <= viewSize.width
                ? (viewSize.width - scaledWidth) / 2
                : clamp(viewport.x, viewSize.width - scaledWidth, 0),
            y: scaledHeight <= viewSize.height
                ? (viewSize.height - scaledHeight) / 2
                : clamp(viewport.y, viewSize.height - scaledHeight, 0),
            zoom: zoom
        )
    }

    static func centeredViewport(in viewSize: CGSize) -> CanvasViewport {
        clampViewport(
            CanvasViewport(
                x: viewSize.width / 2 - canvasWidth / 2,
                y: viewSize.height / 2 - canvasHeight / 2,
                zoom: 1
            ),
            in: viewSize
        )
    }

    static func canvasPoint(for screenPoint: CGPoint, viewport: CanvasViewport) -> CGPoint {
        CGPoint(
            x: (screenPoint.x - viewport.x) / viewport.zoom,
            y: (screenPoint.y - viewport.y) / viewport.zoom
        )
    }

    static func listOrigin(centeredAt point: CGPoint, cascade: Double = 0) -> CGPoint {
        clampListPosition(
            x: point.x - defaultListWidth / 2 + cascade,
            y: point.y - 22 + cascade
        )
    }

    static func movedListPosition(start: CGPoint, translation: CGSize, zoom: Double) -> CGPoint {
        let safeZoom = zoom == 0 ? 1 : zoom
        return CGPoint(
            x: start.x + translation.width / safeZoom,
            y: start.y + translation.height / safeZoom
        )
    }

    static func resizedListWidth(startWidth: Double, translationWidth: Double, zoom: Double) -> Double {
        let safeZoom = zoom == 0 ? 1 : zoom
        return startWidth + translationWidth / safeZoom
    }

    private static func clamp(_ value: Double, _ minValue: Double, _ maxValue: Double) -> Double {
        min(max(value, minValue), maxValue)
    }
}
