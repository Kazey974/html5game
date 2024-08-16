export function jsify(object, type) {
    switch (type) {
        case "Vec3":
            return {
                x: object.GetX(),
                y: object.GetY(),
                z: object.GetZ(),
            };
        case "Quat":
            return {
                x: object.GetX(),
                y: object.GetY(),
                z: object.GetZ(),
                w: object.GetW(),
            }
    }
}