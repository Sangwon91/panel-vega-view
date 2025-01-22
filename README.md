# panel-vega-view

## 1. 개발 이유
1. Altair에서 Vega spec사용 불가능.
2. Panel Vega에서 Vega View API 사용 불가능.

## 2. 필요 기능
- [ ] Notebook에서 확대해서 볼 수 있는 기능. <- 에초에 확대 안해도 잘보이는게 정답일 수도 있음.
- [x] 여러 시그널 값 동시 입력 (현 `last_signal`값에 하나만 입력 가능).
- [ ] ESM 컴파일 (인터넷 불가 환경 고려).
- [x] 현재 뷰를 종료하는 기능.
- [x] 스팩 변경시 다시 랜더링 하는 기능.
- [x] 데이터셋 이름 전부 추출하는 기능 (vega-editor 코드 참고).
- [ ] Transform된 데이터를 로딩하는 기능.
- [x] 이미지를 저장하는 기능 (고화질 PNG).


## 3. 참고 자료
https://panel.holoviz.org/reference/custom_components/JSComponent.html