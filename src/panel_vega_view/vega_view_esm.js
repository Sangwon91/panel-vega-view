import vegaEmbed from "vega-embed";


export function render({ model }) {
  let div = document.createElement("div");
  if (model.opt === null) model.opt = {};

  let globalContext = typeof window !== "undefined" ? window : global;
  if (globalContext.vegaViews === undefined) globalContext.vegaViews = {};

  // Initialize Vega view
  const initializeVega = () => {
    if (this.vegaView) {
      // 종료 기능
      console.log("finalize");
      this.vegaView.finalize();
      console.log("delete view");
      delete globalContext.vegaViews[model.uuid];
    }

    vegaEmbed(div, model.spec, model.opt).then((result) => {
      this.vegaView = result.view;
      console.log("view created");
      globalContext.vegaViews[model.uuid] = result.view;

      let vegaSignals = this.vegaView.getState().signals;
      if (model.signal_names.length === 0)
        model.signal_names = Object.keys(vegaSignals).filter((name) => name != "unit");

      const tempSignals = {};
      model.signal_names.forEach((key) => {
        tempSignals[key] = vegaSignals[key];
        // 시그널 값 변경 감지 및 업데이트
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

    });
  };

  initializeVega();

  // 스펙 변경 시 다시 렌더링
  model.on("spec", () => {
    console.log("spec changed");
    initializeVega();
  });

  // 여러 시그널 동시 입력
  model.on("signals", () => {
    Object.entries(model.signals).forEach(([key, value]) => {
      if (this.vegaView.signal(key) !== value) {
        this.vegaView.signal(key, value);
      }
    });
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

  return div;
}
