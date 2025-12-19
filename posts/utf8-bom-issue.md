---
title: "UTF-8 BOM (Byte Order Mark) 이슈 해결"
date: "2019-11-15"
description: "Unity에서 JSON 파일을 읽고 쓸 때 발생하는 UTF-8 BOM 문제 원인과 해결 방법"
categories: ["JSON", "Troubleshooting"]
---

Unity에서 게임 개발을 하던 중 JSON 파일을 읽고 쓸 때 예상치 못한 문제가 발생했습니다.

직접 제작한 맵 에디터(Unity 기반)로 생성한 JSON을 프로젝트에 Import 하여 사용할 때는 아무 문제가 없었지만, **외부 도구(C# WinForm)로 변환한 JSON**을 사용할 때 문제가 생겼습니다.

![Json Converter UI](/images/posts/utf8-bom-issue/converter-ui.png)
*직접 제작했던 CSV to Json Converter*

## 문제 상황

CSV 데이터를 Unity Serialization 형식에 맞는 JSON으로 변환하는 컨버터를 제작해 사용했습니다.
하지만 이렇게 변환된 JSON 파일을 Unity 프로젝트에 넣고 읽어들이자 `Json Parse Error`가 발생했습니다.

```json
{
  "keys": [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10" ],
  "values": [
    {
      "DropBundleName": "drop_bundle_1",
      "Quantity": [20, 50, 70, 200],
      "ItemID": [21, 21, 21, 21],
      "Percentage": [70, 20, 8, 2],
      "ProbabilitySum": 100
    }
  ]
}
```
*문제가 된 JSON 파일의 예시. 겉보기엔 완벽한 JSON 포맷입니다.*

## 원인 분석: BOM (Byte Order Mark)

원인은 바로 **UTF-8 BOM(Byte Order Mark)** 때문이었습니다.

> [바이트 순서 표식(BOM) 위키백과](https://ko.wikipedia.org/wiki/%EB%B0%94%EC%9D%B4%ED%8A%B8_%EC%88%9C%EC%84%9C_%ED%91%9C%EC%8B%9D)

텍스트 파일의 맨 앞에 '이 파일은 UTF-8 인코딩입니다'라고 알려주는 3바이트(`EF BB BF`)가 숨겨져 있었던 것입니다. 우리 눈에는 보이지 않지만, 바이트 단위로 파일을 읽을 때는 이 데이터가 포함됩니다.

```csharp
public static T LoadJson<T>(string loadPath, string fileName)
{
    using (FileStream fileStream = new FileStream(string.Format("{0}/{1}.json", loadPath, fileName), FileMode.Open))
    {
        byte[] data = new byte[fileStream.Length];
        fileStream.Read(data, 0, data.Length);
        
        // 문제 발생 지점: BOM 바이트까지 전부 문자열로 변환해버림
        string jsonData = Encoding.UTF8.GetString(data, 0, data.Length);
        
        return JsonUtility.FromJson<T>(jsonData);
    }
}
```

`Encoding.UTF8.GetString`으로 바이트 전체를 문자열로 변환하면, 맨 앞의 BOM 바이트가 포함된 문자열이 생성되고, `JsonUtility`는 이를 올바른 JSON 시작(`{`)으로 인식하지 못해 파싱 에러를 뱉는 것이었습니다.

## 해결 시도 1: 바이트 잘라내기 (미봉책)

처음에는 단순히 앞의 3바이트를 건너뛰고 읽도록 수정해 보았습니다.

```csharp
// BOM이 있다는 가정 하에 3바이트 스킵
string jsonData = Encoding.UTF8.GetString(data, 3, data.Length - 3);
```

하지만 모든 JSON 파일에 BOM이 있는 것은 아니었습니다.
어떤 파일은 BOM이 있고, 어떤 파일은 없었기 때문에 아래와 같은 지저분한 분기 처리가 필요해졌습니다.

```csharp
if(withOutBOM)
{
    string jsonData = Encoding.UTF8.GetString(data, 3, data.Length - 3);
}
else
{
    string jsonData = Encoding.UTF8.GetString(data, 0, data.Length);
}
```
이건 근본적인 해결책이 아니라고 판단했습니다.

## 해결 2: 생성 단계에서 BOM 제거 (Converter 수정)

문제가 되는 파일은 제가 만든 **Json Converter**에서 생성되고 있었습니다.
Converter의 저장 로직을 살펴보니 `StreamWriter`를 사용하고 있었는데, 여기서 범인이 발견되었습니다.

```csharp
// 기본 생성자는 BOM을 포함시킵니다!
using (TextWriter json = new StreamWriter(file, System.Text.Encoding.UTF8))
```

C#의 `StreamWriter`에서 `System.Text.Encoding.UTF8`을 그대로 사용하면 기본적으로 BOM을 포함하여 저장합니다.
이를 해결하기 위해 **BOM을 쓰지 않도록설정된 인코딩 객체**를 전달해야 합니다.

```csharp
// UTF8Encoding(false) -> BOM을 방출하지 않음
using (TextWriter json = new StreamWriter(file, new UTF8Encoding(false)))
```

이렇게 `new UTF8Encoding(false)`를 아규먼트로 넘겨주어 Writer를 생성하도록 수정했더니 깔끔하게 해결되었습니다.

### 결론

- Unity의 `JsonUtility`는 BOM 처리를 자동으로 해주지 않을 수 있습니다.
- C# `StreamWriter`는 기본적으로 UTF-8 저장 시 BOM을 포함합니다.
- 데이터 생성 단계(Tool)에서 `UTF8Encoding(false)`를 사용하여 BOM 없이 저장하는 것이 가장 깔끔한 해결책입니다.

이제 BOM 걱정 없이 편하게 JSON을 읽고 쓸 수 있게 되었습니다.
