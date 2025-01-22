import { truthy, falsy } from "vega";
import vegaEmbed from "vega-embed";

export function render({ model }) {
  let div = document.createElement("div");
  let viewDiv = document.createElement("div");
  var button = document.createElement('button');

  // Style the button
  button.textContent = "Download Image";
  button.style.padding = "8px 16px";
  button.style.margin = "10px 0";
  button.style.cursor = "pointer";
  
  div.appendChild(viewDiv);
  // Add new line so that the button is displayed below the vega view.
  div.appendChild(document.createElement('br'));
  // div.appendChild(select);
  div.appendChild(button);
  // div.style.setProperty('transform', 'scale(1)');

  if (model.opt === null) model.opt = {};

  let globalContext = typeof window !== "undefined" ? window : global;
  if (globalContext.vegaViews === undefined) globalContext.vegaViews = {};

  // Initialize Vega view
  const initializeVega = () => {
    if (this.vegaView) {
      console.log("finalize");
      this.vegaView.finalize();
      console.log("delete view");
      delete globalContext.vegaViews[model.uuid];
    }

    vegaEmbed(viewDiv, model.spec, model.opt).then((result) => {
      this.vegaView = result.view;
      console.log("view created");
      globalContext.vegaViews[model.uuid] = result.view;

      let vegaSignals = this.vegaView.getState().signals;
      let vegaData = this.vegaView.getState({
        data: truthy,
        signals: falsy,
        recurse: true,
      }).data
      console.log('vegaData', vegaData);

      model.data_names = Object.keys(vegaData);
      console.log('model.data_names', model.data_names);
      // model.transformed_data = this.vegaView.data('contours');

      if (model.signal_names.length === 0)
        model.signal_names = Object.keys(vegaSignals).filter((name) => name != "unit");

      const tempSignals = {};
      model.signal_names.forEach((key) => {
        tempSignals[key] = vegaSignals[key];
        this.vegaView.addSignalListener(key, (name, value) => {
          if (model.signals[name] !== value) {
            const newSignals = { ...model.signals };
            newSignals[name] = value;
            model.signals = newSignals;
            model.last_signal = { [name]: value };
          }
        });
      });

      model.signals = tempSignals;

      // Add click event listener to the button
      button.addEventListener('click', () => {
        // let type = select.value;
        this.vegaView.toImageURL('png', 5).then(function(url) {
          const link = document.createElement('a');
          link.href = url;
          link.download = 'vega-export.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }).catch(function(error) {
          console.error('Error generating image:', error);
        });
      });
    });
  };

  initializeVega();

  model.on("spec", () => {
    console.log("spec changed");
    initializeVega();
  });

  model.on("signals", () => {
    Object.entries(model.signals).forEach(([key, value]) => {
      if (this.vegaView.signal(key) !== value) {
        this.vegaView.signal(key, value);
      }
    });
    console.log(this.vegaView.getState().data);
    this.vegaView.runAsync();
  });

  model.on("last_signal", () => {
    let key = Object.keys(model.last_signal)[0];
    let value = Object.values(model.last_signal)[0];
    if (this.vegaView.signal(key) !== value) {
      this.vegaView.signal(key, value);
      this.vegaView.runAsync();
    }
  });

  model.on("data_name", () => {
    console.log("data_name changed");
    let vegaData = this.vegaView.getState({
      data: truthy,
      signals: falsy,
      recurse: false,
    }).data
    console.log('vegaData', vegaData);
    // Assign the data to the model.
    model.send_msg(vegaData[model.data_name]);
  });

  return div;
}