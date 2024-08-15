// Función anónima autoejecutable para evitar conflictos con otras librerías
(function () {
    // Declaramos una variable global para el mapa
    var map;

    // Esperamos a que el documento esté listo
    $(document).ready(function () {
        // Inicializamos el mapa en una posición y con un zoom determinados
        map = L.map('map').setView([5.37, -75.65], 10);

        map.createPane("hillshadePane");
        map.createPane("imagePane");
        // Asignando el orden de los niveles en el mapa
        // Mapa base
        map.getPane('hillshadePane').style.zIndex = 0;
        // Capas por países
        map.getPane('imagePane').style.zIndex = 10;

        mapaBase = L.esri.Vector.vectorBasemapLayer("ArcGIS:Hillshade:Dark", {
            apiKey: 'AAPK858e9fb220874181a8cee37c6c7c05e0JFjKsdmGsd2C7oV31x1offnFB9ia6ew61D9N_tANtlZny5LFO1hIU6Xj2To6eiUp',
            opacity: 1,
            pane: "hillshadePane",

        }).addTo(map);
        var google = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
            maxZoom: 19,
            opacity: 0.45,
            pane: "imagePane",
            attribution: '&copy; Google'
        }).addTo(map);
        L.esri.basemapLayer('ImageryLabels',{pane: "imagePane"}).addTo(map);


        var markerCat = L.AwesomeMarkers.icon({
            icon: 'hill-rockslide',
            prefix:'fa',
            markerColor: 'cadetblue'
          });
          
          var markerInv = L.AwesomeMarkers.icon({
            icon: 'hill-rockslide',
            prefix:'fa',
            markerColor: 'orange'
          });
        

        L.geoJSON(linea,{
            color: 'black',
            fillColor: '#f0300000',
            weight: 2, 
            fillOpacity: 0.5,
          }).addTo(map)

          var customIcon = L.divIcon({
            className: 'custom-icon',
            html: '<div style="background-color: yellow; width: 3px; height: 3px; border-radius: 50%;"></div>',
            iconSize: [3, 3]
          });
        
          L.geoJSON(torres, {
            onEachFeature: function (feature, layer) {
                layer.setIcon(customIcon);
              }
          }).addTo(map)

        

        function Mapa(capa, alias, name,aux, active, transp, url, campos, estilos) {
            this.capa = capa;
            this.alias = alias;
            this.name = name;
            this.aux = aux;
            this.active = active;
            this.transp = transp;
            this.url = url;
            this.campos = campos;
            this.estilos = estilos;
            this.CargarCapaMapa = CargarCapaMapa;
            this.RemoverCapaMapa = RemoverCapaMapa;
          }

        var insumosGenerales = [
            new Mapa(null,'slope','Slope Units',0,0,0.5,slopes, [],{
                color: '#ed5151',
                fillColor: '#f0300000',
                weight: 1, 
                fillOpacity: 0.5,
              }),
            new Mapa(null,'cuenca','Cuencas Torrenciales',0,0,0.5,cuencas, [],{
                color: '#149ece',
                fillColor: '#f0300000',
                fillOpacity: 0.5,
                weight: 1, 
              }),
            new Mapa(null,'invPoint','Inventario Puntos',4,0,0.5,inv_point, [],{}),
            new Mapa(null,'invPoly','Inventario Poligonos',3,0,0.5,inv_poly, [],{}),
            new Mapa(null,'invne','Inventario Lineas',3,0,0.5,inv_line, [],{}),
            new Mapa(null,'invExt','Inventario Info Secundaria',2,0,0.5,eventos_externos, [],{}),
            new Mapa(null,'geo','Geología',1,0,0.5,'https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Geologia_final/FeatureServer/0', ["FID", "Geo"],{}),
            new Mapa(null,'geomorfo','Geomorfología',1,0,0.5,'https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Geomorfologia_final/FeatureServer/0', ["FID", "Geoforma"],{}),
          ];

        for (let i = 0; i < insumosGenerales.length; i++) {

            if (insumosGenerales[i].aux == 1) {
                insumosGenerales[i].capa = L.esri.featureLayer({
                    url: insumosGenerales[i].url,
                    cacheLayers: true,
                    simplifyFactor: 0.9, // Simplifica la geometría al 50%
                    precision: 5, // Redondea las coordenadas a 5 decimales
                    fields : insumosGenerales[i].campos,
                    renderer: L.canvas(),
                    onEachFeature: function (feature, layer) {
                        if (feature.properties) {
                            layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                                return k + ": " + feature.properties[k];
                            }).join("<br />"), {
                                maxHeight: 200
                            });
                        }
                    }
                });
            }
            else if(insumosGenerales[i].aux == 0){
                insumosGenerales[i].capa = L.geoJSON(insumosGenerales[i].url, insumosGenerales[i].estilos)
            }
            else if(insumosGenerales[i].aux == 2){
                insumosGenerales[i].capa = L.geoJSON(insumosGenerales[i].url, {
                    onEachFeature: function (feature, layer) {

                        if (feature.properties) {
                            layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                                return k + ": " + feature.properties[k];
                            }).join("<br />"), {
                                maxHeight: 200
                            });
                        }
                    }
                })
            }
            else if(insumosGenerales[i].aux == 4){
                insumosGenerales[i].capa = L.geoJSON(insumosGenerales[i].url, {
                    onEachFeature: function (feature, layer) {
                        if (feature.properties && feature.properties.Proceso === 'Movimiento en Masa') {
                            layer.setIcon(markerCat);
                            } else if (feature.properties && feature.properties.Proceso === 'Erosión') {
                                layer.setIcon(markerInv);
                            } 
                            else {
                                layer.setIcon(markerCat);
                            }
                        if (feature.properties) {
                            layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                                return k + ": " + feature.properties[k];
                            }).join("<br />"), {
                                maxHeight: 200
                            });
                        }
                    }
                })
            }
            else if(insumosGenerales[i].aux == 3){
                insumosGenerales[i].capa = L.geoJSON(insumosGenerales[i].url, {
                    onEachFeature: function (feature, layer) {
                        if (feature.properties) {

                            if (feature.properties && feature.properties.Proceso === 'Movimiento en Masa') {
                                layer.setStyle({
                                    color: 'red',
                                    weight: 2,
                                    fillOpacity: 0.6
                                });
                            } else if (feature.properties && feature.properties.Proceso === 'Erosión') {
                                layer.setStyle({
                                    color: '#c8684a',
                                    weight: 2,
                                    fillOpacity: 0.4
                                });
                            } else {
                                layer.setStyle({
                                    color: 'green',
                                    weight: 1,
                                    fillOpacity: 0.3
                                });
                            }

                            layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                                return k + ": " + feature.properties[k];
                            }).join("<br />"), {
                                maxHeight: 200
                            });
                        }
                    }
                })
            }

            // overlays.push({name: insumosGenerales[i].name, layer: insumosGenerales[i].capa});


            // Dibujando el acordion y los botones de los mapas ugs 25k
            var content = '<li class="content-list first">'+
                '<label class="switch">'+
                    '<input type="checkbox" id="btnGeo25k_'+insumosGenerales[i].alias+'_'+i+'">'+
                    '<span class="slider round"></span>'+
                '</label>'+
                ' '+ insumosGenerales[i].name+
                '<div class="slidecontainer">'+
                    '<input type="range" min="0" max="100" value="50" class="sliderb" id="transp_'+insumosGenerales[i].alias+'_'+i+'">'+
                    '<p>Transparencia: <span id="valTransp_'+insumosGenerales[i].alias+'_'+i+'"></span>%</p>'+
                '</div>'+
            '</li>';

            $("#capasContent").append(content);

            var slider = $("#transp_"+insumosGenerales[i].alias+"_"+i)[0];
            var output = $("#valTransp_"+insumosGenerales[i].alias+"_"+i)[0];
            output.innerHTML = slider.value;
            slider.oninput = function () {
            var id = parseInt($(this).attr('id').split('_')[2]);
            var output = $("#valTransp_"+insumosGenerales[id].alias+"_"+id)[0];
            output.innerHTML = this.value;
            insumosGenerales[id].transp = (100 - parseInt(this.value)) / 100;
            if (insumosGenerales[id].capa != null && insumosGenerales[id].active == 1) {
                insumosGenerales[id].capa.setStyle({fillOpacity : insumosGenerales[id].transp});
            }
            } 

            $("#btnGeo25k_"+insumosGenerales[i].alias+"_"+i).click(function () {
            var id = parseInt($(this).attr('id').split('_')[2]);
            if (insumosGenerales[id].active == 0) {
                insumosGenerales[id].active = 1;
                insumosGenerales[id].CargarCapaMapa();
            } else if (insumosGenerales[id].active == 1) {
                insumosGenerales[id].active = 0;
                insumosGenerales[id].RemoverCapaMapa();
            }
            }); 

        }


        function CargarCapaMapa() {
            this.capa.addTo(map);
            if (this.name == 'Mapa Geológico de Colombia' || this.name == 'Mapa de Fallas Regionales') {
              this.capa.setOpacity(this.transp);
            } else {
              this.capa.setStyle({fillOpacity : this.transp});
            }
          }
          // Función para Remover los Mapas
          function RemoverCapaMapa() {
            map.removeLayer(this.capa);
          }


        // L.esri.Vector.vectorTileLayer("https://vectortileservices7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Geologia_final_otro/VectorTileServer", {
        //     apiKey : 'AAPK858e9fb220874181a8cee37c6c7c05e0JFjKsdmGsd2C7oV31x1offnFB9ia6ew61D9N_tANtlZny5LFO1hIU6Xj2To6eiUp',
        //     opacity: 1.65,

        // }).bindPopup(
        //     console.log("layer.feature.properties")


        // ).addTo(map);


        /* <------------------- Barra Lateral -------------------> */

        // Inicializamos la barra lateral y la añadimos al mapa
        sidebar = L.control.sidebar({
            autopan: false, // whether to maintain the centered map point when opening the sidebar
            closeButton: true, // whether t add a close button to the panes
            container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
            position: 'left', // left or right
        }).addTo(map);



        function convertPolygonsToLines(polygonGeoJson) {
            var lines = [];
            
            polygonGeoJson.features.forEach(function(feature) {
              if (feature.geometry.type === 'Polygon') {
                var coordinates = feature.geometry.coordinates;
                
                // Convertir el exterior del polígono en una línea
                var exteriorCoords = coordinates[0]; // El exterior del polígono
                var exteriorLine = turf.lineString(exteriorCoords);
                lines.push(exteriorLine);
                
                // Convertir los interiores (agujeros) del polígono en líneas
                for (var i = 1; i < coordinates.length; i++) {
                  var interiorCoords = coordinates[i];
                  var interiorLine = turf.lineString(interiorCoords);
                  lines.push(interiorLine);
                }
              }
            });
            
            return lines;
          }
      
          // Convertir los polígonos a líneas
          var lines = convertPolygonsToLines(slopes);
      
          // Crear un nuevo FeatureCollection para las líneas
          var linesFeatureCollection = {
            "type": "FeatureCollection",
            "features": lines.map(function(line) {
              return {
                "type": "Feature",
                "geometry": line.geometry,
                "properties": {}
              };
            })
          };
      
          // Mostrar el resultado
          console.log(JSON.stringify(linesFeatureCollection, null, 2));





        // Creamos una función que se ejecutará cada vez que se cree una nueva capa
        map.on('pm:create', function (e) {
            // Obtenemos la capa creada y su GeoJSON
            const layer = e.layer;
            const geojson = layer.toGeoJSON();
            console.log(geojson);
            // Creamos un nombre para la capa e incrementamos el contador de capas creadas
            const nombre = layer.pm._shape + " " + contador;
            contador++;
            // Añadimos la capa creada al control de capas
            legend.addOverlay({
                name: nombre,
                layer: layer
            });
        });



        /* <------------------- Control de Herramienta de MiniMapa -------------------> */

        // Creamos el mapa base para el minimapa
        var osm2 = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 0,
            maxZoom: 13,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        // Se crean los estilos para el rectangulo y la sombra que representa el area visible en el minimapa
        var rect1 = {
            color: "#ff1100",
            weight: 3
        };
        var rect2 = {
            color: "#0000AA",
            weight: 1,
            opacity: 0,
            fillOpacity: 0
        };
        // Creamos el control de minimapa y lo añadimos al mapa
        var miniMap = new L.Control.MiniMap(osm2, {
            toggleDisplay: true,
            aimingRectOptions: rect1,
            shadowRectOptions: rect2
        }).addTo(map);


    });
})();