import SwiftUI

// MARK: - Color Hex Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a: UInt64
        let r: UInt64
        let g: UInt64
        let b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Shared Leaf Shape

struct LeafShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        path.move(to: CGPoint(x: w * 0.5, y: 0))
        path.addQuadCurve(
            to: CGPoint(x: w * 0.5, y: h),
            control: CGPoint(x: w, y: h * 0.5)
        )
        path.addQuadCurve(
            to: CGPoint(x: w * 0.5, y: 0),
            control: CGPoint(x: 0, y: h * 0.5)
        )
        path.closeSubpath()
        return path
    }
}

// MARK: - Carbon Logo View

struct CarbonLogoView: View {
    var size: CGFloat = 40
    var showLabel: Bool = true

    var body: some View {
        VStack(spacing: size * 0.12) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color(hex: "#10b981"), Color(hex: "#059669")],
                            startPoint: UnitPoint(x: 0.25, y: 0),
                            endPoint: UnitPoint(x: 0.75, y: 1)
                        )
                    )
                    .frame(width: size, height: size)

                LeafShape()
                    .fill(Color.white.opacity(0.92))
                    .frame(width: size * 0.5, height: size * 0.5)
                    .rotationEffect(.degrees(-45))
            }

            if showLabel {
                Text("cCarbon")
                    .font(.system(size: size * 0.35, weight: .semibold))
                    .foregroundStyle(Color.white)
            }
        }
    }
}

// MARK: - Preview

#Preview {
    ZStack {
        Color(hex: "#0b1120").ignoresSafeArea()
        VStack(spacing: 32) {
            CarbonLogoView(size: 80, showLabel: true)
            CarbonLogoView(size: 40, showLabel: false)
        }
    }
}
