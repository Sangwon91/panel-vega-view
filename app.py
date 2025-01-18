import panel as pn
from panel_vega_view import VegaView


pn.extension('ace', 'jsoneditor')


spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Drag out a rectangular brush to highlight points.",
  "data": {"url": "https://raw.githubusercontent.com/vega/vega/refs/heads/main/docs/data/cars.json"},
  "params": [{
    "name": "brush",
    "select": "interval",
    "value": {"x": [55, 160], "y": [13, 37]}
  },{
    "name": "point_sel",
    "select": "point",
  },
  ],
  "mark": "point",
  "encoding": {
    "x": {"field": "Horsepower", "type": "quantitative"},
    "y": {"field": "Miles_per_Gallon", "type": "quantitative"},
    "color": {
      "condition": {"param": "brush", "field": "Cylinders", "type": "ordinal"},
      "value": "grey"
    },
    "size": {
      "condition": {"param": "point_sel", "value": 100},
      "value": 10,
    },
    "facet": {
      "field": "Cylinders",
      "columns": 2
    }
  }
}


spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"url": "https://raw.githubusercontent.com/vega/vega/master/docs/data/movies.json"},
  "transform": [{
    "filter": {"and": [
      {"field": "IMDB Rating", "valid": True},
      {"field": "Rotten Tomatoes Rating", "valid": True}
    ]}
  }],
  "params": [
      {
        "name": "colorDomain",
        "value": [0, 30],
      },
      {
        "name": "brush",
        "select": "interval",
        # "value": {"x": [55, 160], "y": [13, 37]}
      },
      {
          "name": "x_bins",
          "value": 40,
      },
      {
          "name": "y_bins",
          "value": 40,
      },
      {
        "name": "point_sel",
        "select": "point",
      },
  ],
  "mark": {
      "type": "rect",
      "width": 5,
      "height": 5,
  },
  # "width": "container",
  "height": 300,
  "width": 300,
  "encoding": {
    # "size": 5,
    "x": {
      "bin": {"maxbins": 40},
      "field": "IMDB Rating",
      "type": "quantitative"
    },
    "y": {
      "bin": {"maxbins": 40},
      "field": "Rotten Tomatoes Rating",
      "type": "quantitative"
    },
    "color": {
      "condition": {
        "param": "brush",
        "aggregate": "count",
        "type": "quantitative",
        "scale": {
            "domain": {"expr": "colorDomain"},
        }
      },
      "value": "grey"
    }
  },
  "config": {
    "view": {
      "stroke": "transparent"
    }
  }
}


vv = VegaView(
    spec=spec,
    opt={
        "actions": True,
    },
    signal_names=[
        "point_sel",
        "brush",
        "colorDomain",
        # "height",
        # "brush_x",
        # "brush_tuple",
    ],
)

print(vv.param)

json_editor = pn.widgets.JSONEditor(value=vv.param.signals, width=300)
json_editor.jslink(vv, code={"value": """
console.log('JSON', source);
console.log('JSON', target.model_proxy.uuid);
let vegaView = window.vegaViews[target.model_proxy.uuid];

Object.entries(source.value).forEach(([key, value]) => {
  console.log(key, value);
  if (value != null && value != undefined)
    vegaView.signal(key, value);
});
vegaView.runAsync();
"""})
# json_editor2 = pn.widgets.JSONEditor(value=vv.param.data, width=300)
color_lims = pn.widgets.RangeSlider(name='Color limits', start=0, end=125, value=(0, 40), step=1)
color_lims.jslink(vv, code={'value': """
target.model_proxy.last_signal = {"colorDomain": source.value};
"""})
vv.jslink(color_lims, code={'last_signal': """
console.log('Bind', target.value);
target.value = source.last_signal.colorDomain;                         
"""})

color_lims2 = pn.widgets.RangeSlider(name='Color limits', start=0, end=125, value=(0, 40), step=1)
color_lims2.jslink(vv, code={'value': """
console.log('Color');
target.model_proxy.last_signal = {"colorDomain": source.value};
"""})


uuid = pn.widgets.TextInput(value=vv.param.uuid)

pn.Column(
  pn.Row(
      vv,
      json_editor,
      # json_editor2,
  ),
  color_lims,
  color_lims2,
  uuid,
).servable()