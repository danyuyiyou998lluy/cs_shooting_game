// 碰撞检测工具

// 检查两个球体之间的碰撞
function checkSphereCollision(position1, radius1, position2, radius2) {
    // 计算两点之间的距离
    const distance = position1.distanceTo(position2);
    
    // 检查距离是否小于两个半径之和
    return distance < (radius1 + radius2);
}

// 检查射线与平面的碰撞
function checkRayPlaneCollision(rayOrigin, rayDirection, planeNormal, planePoint) {
    // 计算射线与平面的夹角余弦值
    const denominator = rayDirection.dot(planeNormal);
    
    // 如果射线与平面平行或几乎平行，则没有碰撞
    if (Math.abs(denominator) < 0.0001) {
        return null;
    }
    
    // 计算射线原点到平面的距离
    const t = planePoint.clone().sub(rayOrigin).dot(planeNormal) / denominator;
    
    // 如果t为负数，则平面在射线后方
    if (t < 0) {
        return null;
    }
    
    // 计算碰撞点
    const intersectionPoint = rayOrigin.clone().add(rayDirection.clone().multiplyScalar(t));
    
    return {
        point: intersectionPoint,
        distance: t
    };
}

// 检查射线与立方体的碰撞
function checkRayBoxCollision(rayOrigin, rayDirection, boxMin, boxMax) {
    let tmin = (boxMin.x - rayOrigin.x) / rayDirection.x;
    let tmax = (boxMax.x - rayOrigin.x) / rayDirection.x;
    
    if (tmin > tmax) {
        const temp = tmin;
        tmin = tmax;
        tmax = temp;
    }
    
    let tymin = (boxMin.y - rayOrigin.y) / rayDirection.y;
    let tymax = (boxMax.y - rayOrigin.y) / rayDirection.y;
    
    if (tymin > tymax) {
        const temp = tymin;
        tymin = tymax;
        tymax = temp;
    }
    
    if ((tmin > tymax) || (tymin > tmax)) {
        return null;
    }
    
    if (tymin > tmin) {
        tmin = tymin;
    }
    
    if (tymax < tmax) {
        tmax = tymax;
    }
    
    let tzmin = (boxMin.z - rayOrigin.z) / rayDirection.z;
    let tzmax = (boxMax.z - rayOrigin.z) / rayDirection.z;
    
    if (tzmin > tzmax) {
        const temp = tzmin;
        tzmin = tzmax;
        tzmax = temp;
    }
    
    if ((tmin > tzmax) || (tzmin > tmax)) {
        return null;
    }
    
    if (tzmin > tmin) {
        tmin = tzmin;
    }
    
    if (tzmax < tmax) {
        tmax = tzmax;
    }
    
    // 如果tmax < 0，则立方体在射线后方
    if (tmax < 0) {
        return null;
    }
    
    // 计算碰撞点
    const t = tmin < 0 ? tmax : tmin;
    const intersectionPoint = rayOrigin.clone().add(rayDirection.clone().multiplyScalar(t));
    
    return {
        point: intersectionPoint,
        distance: t
    };
}

// 检查点是否在立方体内
function isPointInBox(point, boxMin, boxMax) {
    return (
        point.x >= boxMin.x && point.x <= boxMax.x &&
        point.y >= boxMin.y && point.y <= boxMax.y &&
        point.z >= boxMin.z && point.z <= boxMax.z
    );
}

// 检查两个立方体是否碰撞
function checkBoxCollision(min1, max1, min2, max2) {
    return (
        min1.x <= max2.x && max1.x >= min2.x &&
        min1.y <= max2.y && max1.y >= min2.y &&
        min1.z <= max2.z && max1.z >= min2.z
    );
}
