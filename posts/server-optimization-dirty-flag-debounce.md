---
title: "Java 서버 최적화: DirtyFlag와 Batch 처리, 그리고 클라이언트 디바운싱"
date: "2025-12-19"
category: "Java"
---

> **Note**: 본 포스팅에 포함된 코드는 보안상 실제 프로덕션 코드가 아닌, 이해를 돕기 위해 재구성된 예제 코드입니다.

## 문제점

서버 개발을 하다 보면 상태가 변경될 때마다 클라이언트에게 업데이트 패킷을 보내는 경우가 많습니다. 하지만 이를 무분별하게 `sendUpdate`로 처리하면 네트워크 트래픽이 급증하고 성능 저하를 유발할 수 있습니다.

```java
public void setHp(int hp) {
    this.hp = hp;
    sendUpdate(); // 변경될 때마다 즉시 전송
}

public void setMp(int mp) {
    this.mp = mp;
    sendUpdate(); // 변경될 때마다 즉시 전송
}
```

만약 한 프레임 내에서 HP와 MP가 동시에 변경된다면, 불필요하게 두 번의 패킷이 전송되는 셈입니다.

## 서버 최적화: DirtyFlag와 Batch 처리

이 문제를 해결하기 위해 **DirtyFlag** 패턴과 **Batch** 처리를 도입했습니다. `Room`이라는 공간에서 상태 변경이 일어날 때 즉시 전송하는 대신, "변경되었다"는 표시(DirtyFlag)만 남겨두고 정해진 주기(Tick)마다 모아서 처리하는 방식입니다.

### DirtyFlagManager와 BitFlag

단순히 "변경되었다"는 사실뿐만 아니라, "무엇이" 변경되었는지 알기 위해 BitFlag를 활용합니다. 그리고 이를 관리하는 `DirtyFlagManager`를 도입했습니다.

```java
public class DirtyFlagManager {
    private long dirtyFlags = 0L;

    public void markDirty(long flag) {
        this.dirtyFlags |= flag;
    }

    public void flush(Player player) {
        if (dirtyFlags == 0L) return;

        if ((dirtyFlags & Flags.HP) != 0) {
            player.send(new HpUpdatePacket());
        }
        if ((dirtyFlags & Flags.MP) != 0) {
            player.send(new MpUpdatePacket());
        }
        
        // ... 다른 플래그 처리
        
        this.dirtyFlags = 0L; // 처리 후 초기화
    }
}
```

### Room 클래스 적용

각 객체(여기서는 `Room`이나 `Player`)는 `DirtyFlagManager`를 멤버로 가집니다.

```java
public class Room {
    private DirtyFlagManager dirtyManager = new DirtyFlagManager();
    private List<Player> players = new ArrayList<>();

    public void setHp(int hp) {
        this.hp = hp;
        dirtyManager.markDirty(Flags.HP); // HP 변경 플래그 설정
    }

    public void setMp(int mp) {
        this.mp = mp;
        dirtyManager.markDirty(Flags.MP); // MP 변경 플래그 설정
    }

    // 주기적으로 호출되는 메서드
    public void tick() {
        for (Player p : players) {
            dirtyManager.flush(p); // 각 플레이어에게 변경사항 전송
        }
    }
}
```

이제 `setHp`와 `setMp`가 한 틱 내에 동시에 호출되더라도, `flush` 단계에서 플래그를 확인하여 필요한 패킷만 효율적으로 구성해서 보낼 수 있습니다.

## 클라이언트 최적화: 디바운싱 (Debouncing)

서버에서 배치 처리를 하더라도, 게임이나 실시간 서비스의 특성상 패킷은 여전히 자주 도착할 수 있습니다. 클라이언트에서 패킷을 받을 때마다 UI를 갱신하면 렌더링 부하가 심해져 화면이 깜빡이거나 버벅거릴 수 있습니다.

이를 해결하기 위해 **디바운싱(Debouncing)** 기법을 적용했습니다. 마지막 요청이 들어온 후 일정 시간이 지날 때까지 기다렸다가 한 번만 처리하는 방식입니다.

### 디바운싱 적용 예시 (Unity C#)

```csharp
using UnityEngine;

public class GameClient : MonoBehaviour {
    private bool isRefreshPending = false;
    private float debounceTimer = 0f;
    private const float DEBOUNCE_DELAY = 0.1f; // 100ms

    // 패킷 수신 시 호출
    public void OnPacketReceived(UpdatePacket packet) {
        // 데이터 업데이트
        UpdateModel(packet);

        // 갱신 요청 예약 (타이머 초기화)
        isRefreshPending = true;
        debounceTimer = DEBOUNCE_DELAY;
    }

    private void Update() {
        if (isRefreshPending) {
            debounceTimer -= Time.deltaTime;
            
            if (debounceTimer <= 0) {
                RefreshUI();
                isRefreshPending = false;
            }
        }
    }

    private void RefreshUI() {
        // 실제 UI 갱신 로직
        Debug.Log("UI Refreshed!");
    }

    private void UpdateModel(UpdatePacket packet) {
        // 모델 업데이트 로직
    }
}
```

이렇게 하면 패킷이 10ms 간격으로 쏟아지더라도, 마지막 패킷이 도착하고 100ms가 지난 뒤에 딱 한 번만 UI를 그립니다.

## 결론

서버에서는 **DirtyFlag & Batch**로 패킷 전송 횟수를 줄이고, 클라이언트에서는 **Debouncing**으로 렌더링 횟수를 줄였습니다.

이 두 가지 최적화를 적용한 결과, 네트워크 대역폭이 절약되고 클라이언트의 화면 갱신도 훨씬 부드러워졌습니다. 이번 작업을 통해 무조건적인 실시간 처리보다는 상황에 맞는 적절한 지연 처리가 시스템 전체의 효율을 높여준다는 점을 확인할 수 있었습니다.
