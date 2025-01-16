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


vv = VegaView(
    spec=spec,
    opt={
        "actions": False,
    },
    # signal_names=[
    #     # "point_sel",
    #     # "brush",
    #     # "height",
    #     # "brush_x",
    #     # "brush_tuple",
    # ],
)

print(vv.signals)

json_editor = pn.widgets.JSONEditor(value=vv.signals, width=300)

# code = """
#     console.log(target.value);
#     // console.log(source.signals);
#     // let vegaView = window.vegaViews[source.uuid];
#     // target.value = JSON.stringify(source.signals);
# """
# vv.jslink(json_editor, code={"signals": code})

# print(json_editor.value)

def set_v(signals):
    print('hi')
    json_editor.value = signals

pn.bind(set_v, signals=vv.param.signals)

pn.Row(
    vv,
    json_editor,
    json_editor.controls(jslink=True),
).servable()