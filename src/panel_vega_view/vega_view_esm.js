import vegaEmbed from "vega-embed";

export function render({ model }) {
  let div = document.createElement("div");
  
  let spec = model.spec;
  let opt = model.opt;

  if (opt === null)
      opt = {};

  let globalContext = (typeof window!== 'undefined')? window : global;
  if (globalContext.vegaViews === undefined)
    globalContext.vegaViews = {};

  vegaEmbed(div, spec, opt).then((result) => {
    // 클레스에 vegaView 변수 추가.
    this.vegaView = result.view;
    // 글로벌 스코프의 딕셔너리에 vegaView인자를 uid를 키로 저장.
    globalContext.vegaViews[model.uuid] = result.view;

    // 현 chart의 모든 signal 값 딕셔너리.
    let vegaSignals = this.vegaView.getState().signals;
    console.log(vegaSignals);
    if (model.signal_names.length == 0)
      model.signal_names = Object.keys(vegaSignals).filter(name => name != "unit");
      // model.signal_names = Object.keys(vegaSignals);
        
    // 사용되지 않는 임시 변수.
    // let vegaData = this.vegaView.getState().data;

    // Object.entries(vegaSignals).forEach(([key, value]) => {
    model.signal_names.forEach(key => {
      model.signals[key] = vegaSignals[key];
      console.log("Signal: ", key, vegaSignals[key]);
      // Vega에서 이벤트가 발생할 때 발생한 이벤트의 종류와 값을 
      // 시그널 버퍼에 추가.  
      this.vegaView.addSignalListener(key, (name, value) => {
        const newSignals = {...model.signals};
        newSignals[name] = value;
        model.signals = newSignals;
        model.last_signal = {[name]: value};
      });

    });

  });

  return div
}