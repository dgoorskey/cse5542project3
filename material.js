function material_new(ambient_color, diffuse_color, specular_color, emission_color, reflectivity) {
    return {
        ambient: ambient_color,
        diffuse: diffuse_color,
        specular: specular_color,
        emission: emission_color,
        reflectivity: reflectivity,
    }
}

