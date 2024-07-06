type Orbit = {
    semiMajorAxis: number
    eccentricity: number
    inclination:  number
    raan: number
    argOfPeriapsis: number
    meanAnomaly: number
}

type Vector3 = {
    x: number
    y: number
    z: number
}

export const getPeriapsis = (orbit: Orbit): number => {
    return orbit.semiMajorAxis * (1 - orbit.eccentricity);
}

export const getApoapsis = (orbit: Orbit): number => {
    return orbit.semiMajorAxis * (1 + orbit.eccentricity);
}


export const getPositionInOrbit = (orbit: Orbit): Vector3 => {
    const { semiMajorAxis, eccentricity, inclination, raan, argOfPeriapsis, meanAnomaly } = orbit;

    // Berechne die exzentrische Anomalie
    let eccentricAnomaly = meanAnomaly;
    let delta;
    do {
        const nextEccentricAnomaly = eccentricAnomaly + (meanAnomaly - eccentricAnomaly + eccentricity * Math.sin(eccentricAnomaly)) / (1 - eccentricity * Math.cos(eccentricAnomaly));
        delta = Math.abs(nextEccentricAnomaly - eccentricAnomaly);
        eccentricAnomaly = nextEccentricAnomaly;
    } while (delta > 1e-6);

    // Berechne die wahre Anomalie
    const trueAnomaly = 2 * Math.atan2(Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2), Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2));

    // Position in der Orbitalebene
    const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
    const orbitalPlaneX = r * Math.cos(trueAnomaly);
    const orbitalPlaneY = r * Math.sin(trueAnomaly);

    // Umwandlung in 3D-Raumkoordinaten
    const cosOmega = Math.cos(raan);
    const sinOmega = Math.sin(raan);
    const cosI = Math.cos(inclination);
    const sinI = Math.sin(inclination);
    const cosArgPeri = Math.cos(argOfPeriapsis);
    const sinArgPeri = Math.sin(argOfPeriapsis);

    const rotationMatrixX1 = cosOmega * cosArgPeri - sinOmega * sinArgPeri * cosI;
    const rotationMatrixY1 = sinOmega * cosArgPeri + cosOmega * sinArgPeri * cosI;
    const rotationMatrixZ1 = sinArgPeri * sinI;

    const rotationMatrixX2 = -cosOmega * sinArgPeri - sinOmega * cosArgPeri * cosI;
    const rotationMatrixY2 = -sinOmega * sinArgPeri + cosOmega * cosArgPeri * cosI;
    const rotationMatrixZ2 = cosArgPeri * sinI;

    const x = rotationMatrixX1 * orbitalPlaneX + rotationMatrixX2 * orbitalPlaneY;
    const y = rotationMatrixY1 * orbitalPlaneX + rotationMatrixY2 * orbitalPlaneY;
    const z = rotationMatrixZ1 * orbitalPlaneX + rotationMatrixZ2 * orbitalPlaneY;

    return { x, y, z };
}
