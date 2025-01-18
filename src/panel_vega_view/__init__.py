from uuid import uuid4
from pathlib import Path
import param
from panel.custom import JSComponent


class VegaView(JSComponent):

    spec = param.Dict()
    opt = param.Dict()
    uuid = param.String(str(uuid4()), readonly=True)
    signals = param.Dict({})
    last_signal = param.Dict({})
    signal_names = param.List()

    _importmap = {
        "imports": {
            "vega-embed": "https://cdn.jsdelivr.net/npm/vega-embed@6.26.0/+esm",
        }
    }

    _esm = (Path(__file__).parent / "vega_view_esm.js")
