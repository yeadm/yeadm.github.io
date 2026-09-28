// 1. 카카오 지도 생성
var container = document.getElementById("map");
var options = {
  center: new kakao.maps.LatLng(37.5665, 126.978), // 초기 서울시청 좌표
  level: 3,
};
var map = new kakao.maps.Map(container, options);

// 2. 장소 검색 서비스 및 마커/인포윈도우 관리 변수
var ps = new kakao.maps.services.Places();
var markers = []; // 여러 개의 검색 결과 마커를 저장할 배열
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 3. 키워드 검색 실행 함수
function searchPlaces() {
  var keyword = document.getElementById("keyword").value.trim();

  if (!keyword) {
    alert("키워드를 입력해주세요!");
    return;
  }

  // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
  ps.keywordSearch(keyword, placesSearchCB);
}

// 4. 장소검색 완료 시 호출되는 콜백함수
function placesSearchCB(data, status, pagination) {
  if (status === kakao.maps.services.Status.OK) {
    // 정상적으로 검색 완료 시 검색 목록과 마커 표출
    displayPlaces(data);
  } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
    alert("검색 결과가 존재하지 않습니다.");
    clearMapAndList();
  } else if (status === kakao.maps.services.Status.ERROR) {
    alert("검색 결과 중 오류가 발생했습니다.");
  }
}

// 5. 검색 결과 목록과 마커를 표출하는 함수
function displayPlaces(places) {
  var listEl = document.getElementById("placesList");
  var bounds = new kakao.maps.LatLngBounds();

  // 기존에 있던 마커와 목록 제거
  clearMapAndList();

  for (var i = 0; i < places.length; i++) {
    // 마커를 생성하고 지도에 표시합니다
    var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x);
    var marker = addMarker(placePosition, i);
    var itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element 생성

    // 검색된 장소 위치를 기준으로 지도 범위를 넓히기 위해 LatLngBounds 객체에 좌표 추가
    bounds.extend(placePosition);

    // 마커와 검색결과 항목에 mouseover / mouseout / click 이벤트 등록
    (function (marker, title, placePosition) {
      // 마커 클릭 시 해당 위치로 부드럽게 이동 및 확대
      kakao.maps.event.addListener(marker, "click", function () {
        map.setLevel(3);
        map.panTo(placePosition);
        displayInfowindow(marker, title);
      });

      // 리스트 항목 클릭 시 해당 마커 위치로 이동
      itemEl.onclick = function () {
        map.setLevel(3);
        map.panTo(placePosition);
        displayInfowindow(marker, title);
      };
    })(marker, places[i].place_name, placePosition);

    listEl.appendChild(itemEl);
  }

  // 검색된 장소들의 위치를 포함하는 지도 범위 설정 (모든 결과가 보이도록 조정)
  map.setBounds(bounds);
  map.relayout();
}

// 6. 검색결과 항목(Element)을 반환하는 함수
function getListItem(index, places) {
  var el = document.createElement("li");
  var itemStr =
    '<div class="info">' +
    "   <h5>" +
    (index + 1) +
    ". " +
    places.place_name +
    "</h5>";

  if (places.road_address_name) {
    itemStr +=
      "    <span>" +
      places.road_address_name +
      "</span>" +
      '   <span class="jibun gray">' +
      places.address_name +
      "</span>";
  } else {
    itemStr += "    <span>" + places.address_name + "</span>";
  }

  itemStr += '  <span class="tel">' + places.phone + "</span>" + "</div>";

  el.innerHTML = itemStr;
  el.className = "item";

  return el;
}

// 7. 지도에 커스텀 마커를 추가하는 함수
function addMarker(position, idx) {
  // 1. 커스텀 마커 이미지 주소 지정 (💡 정확한 확장자까지 입력해 주세요!)
  var imageSrc = "./img/PIN.svg";

  // 2. 마커 이미지의 크기 및 중심점(offset) 설정
  var imageSize = new kakao.maps.Size(40, 40); // 가로 40px, 세로 40px 크기
  var imageOption = { offset: new kakao.maps.Point(20, 40) }; // 이미지 바닥 중앙이 지도 좌표에 딱 맞도록 설정

  // 3. 마커 이미지 객체 생성
  var markerImage = new kakao.maps.MarkerImage(
    imageSrc,
    imageSize,
    imageOption,
  );

  // 4. image 옵션을 포함하여 마커 생성
  var marker = new kakao.maps.Marker({
    position: position,
    image: markerImage, // 커스텀 이미지 적용
    map: map,
  });

  markers.push(marker);
  return marker;
}

// 8. 기존 마커 및 리스트 삭제 함수
function clearMapAndList() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  var listEl = document.getElementById("placesList");
  if (listEl) {
    listEl.innerHTML = "";
  }
  infowindow.close();
}

// 9. 인포윈도우(말풍선) 표출 함수
function displayInfowindow(marker, title) {
  var content =
    '<div style="padding:5px;z-index:1;font-size:12px;color:#333;">' +
    title +
    "</div>";
  infowindow.setContent(content);
  infowindow.open(map, marker);
}

// 10. 이벤트 연결 (검색 버튼 클릭 및 엔터키)
document.getElementById("search-btn").addEventListener("click", searchPlaces);

document.getElementById("keyword").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    searchPlaces();
  }
});
