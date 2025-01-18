import vegaEmbed from "vega-embed";


export function render({ model }) {
  let div = document.createElement("div");

  let spec = model.spec;
  let opt = model.opt;

  if (opt === null) opt = {};

  let globalContext = typeof window !== "undefined" ? window : global;
  if (globalContext.vegaViews === undefined) globalContext.vegaViews = {};

  vegaEmbed(div, spec, opt).then((result) => {
    // 클레스에 vegaView 변수 추가.
    this.vegaView = result.view;
    // 글로벌 스코프의 딕셔너리에 vegaView인자를 uid를 키로 저장.
    globalContext.vegaViews[model.uuid] = result.view;

    // 현 chart의 모든 signal 값 딕셔너리.
    let vegaSignals = this.vegaView.getState().signals;
    console.log(vegaSignals);
    // TODO: Remove keys of unserializable.
    if (model.signal_names.length == 0)
      model.signal_names = Object.keys(vegaSignals).filter((name) => name != "unit");

    const tempSignals = {};
    model.signal_names.forEach((key) => {
      tempSignals[key] = vegaSignals[key];
      // Vega에서 이벤트가 발생할 때 발생한 이벤트의 종류와 값을 업데이트.
      this.vegaView.addSignalListener(key, (name, value) => {
        if (model.signals[name] !== value) { // 기존 값과 다를 때만 업데이트
          const newSignals = { ...model.signals };
          newSignals[name] = value;
          model.signals = newSignals;
          model.last_signal = { [name]: value };
        }
      });
    });

    model.signals = tempSignals;

    // TODO: 순환 실행이 발생하는지 확인 필요.
    model.on("last_signal", () => {
      console.log("Last signal", model.last_signal);
      let key = Object.keys(model.last_signal)[0];
      let value = Object.values(model.last_signal)[0];
      if (this.vegaView.signal(key) !== value) { // 기존 값과 다를 때만 signal 업데이트
        this.vegaView.signal(key, value);
        this.vegaView.runAsync();
      }
      
    });

  });

  return div;
}
