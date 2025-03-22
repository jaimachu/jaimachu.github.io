library(readr)
library(dplyr)


guess_encoding("C:\\Users\\jaime\\Desktop\\Cursos y pruebas\\GisGame-V1\\pobmun24.csv")

municipios_coordenadas <- read.csv("C:\\Users\\jaime\\Desktop\\Cursos y pruebas\\GisGame-V1\\.aux\\municipios.csv", 
                                   sep = ";", 
                                   fileEncoding = "UTF-8")
municipios_coordenadas <- municipios_coordenadas %>%
  mutate(Población = gsub("(.*) \\((.*)\\)", "\\1, \\2", Población))

municipios_2024 <- read.csv("C:\\Users\\jaime\\Desktop\\Cursos y pruebas\\GisGame-V1\\.aux\\pobmun24.csv", 
                            sep = ";", 
                            fileEncoding = "ISO-8859-1")

municipios_final <- municipios_2024 %>%
  left_join(municipios_coordenadas, by = c("NOMBRE" = "Población")) %>%
  select(Comunidad, PROVINCIA, NOMBRE, POB24, Latitud, Longitud) %>%  # Aquí seleccionas la columna 'Comunidad' de 'municipios_coordenadas'
  filter(!is.na(Latitud) | !is.na(Longitud)) %>%
  mutate(
    Latitud = as.numeric(gsub(",", ".", Latitud)),
    Longitud = as.numeric(gsub(",", ".", Longitud))
  ) 


municipios_sin_coordenadas <- municipios_final %>%
  filter(is.na(Latitud) | is.na(Longitud))

municipios_sin_coordenadas

write.csv(municipios_final, "C:\\Users\\jaime\\Desktop\\Cursos y pruebas\\GisGame-V1\\municipios_final.csv", 
          row.names = FALSE)

write.csv(municipios_sin_coordenadas, "C:\\Users\\jaime\\Desktop\\Cursos y pruebas\\GisGame-V1\\municipios_no_coords.csv", 
          row.names = FALSE)


municipios_sin_coordenadas

municipios_no_encontrados <- municipios_coordenadas %>%
  anti_join(municipios_final, by = c("Población" = "NOMBRE"))


municipios_no_encontrados <- read.csv("C:\\Users\\jaime\\Desktop\\Cursos y pruebas\\GisGame-V1\\municipios_faltantes.csv", 
                                      sep=";",
                                      fileEncoding = "ISO-8859-1")
municipios_no_encontrados <- municipios_no_encontrados %>%
  mutate(
    Latitud = as.numeric(gsub(",", ".", Latitud)),
    Longitud = as.numeric(gsub(",", ".", Longitud))
  ) %>%
  select(Comunidad, PROVINCIA, NOMBRE, POB24, Latitud, Longitud)

municipios_final <- bind_rows(municipios_final, municipios_no_encontrados)

municipios_final <- municipios_final %>%
  rename(
    Comunidad = Comunidad,
    Provincia = PROVINCIA,
    Municipio = NOMBRE,
    Población = POB24,
    Latitud = Latitud,
    Longitud = Longitud
  )
municipios_final <- municipios_final %>%
  mutate(Municipio = ifelse(grepl(",", Municipio), 
                         gsub("(.*), (.*)", "\\2 \\1", Municipio), 
                         Municipio))

write.csv(municipios_final, "C:\\Users\\jaime\\Desktop\\Cursos y pruebas\\GisGame-V1\\municipios_final.csv", 
          row.names = FALSE)
