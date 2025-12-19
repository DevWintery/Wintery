---
title: "Java 치트키 시스템 리팩토링: If-Else에서 리플렉션까지"
date: "2025-11-30"
category: "Java"
---

> **Note**: 본 포스팅에 포함된 코드는 보안상 실제 프로덕션 코드가 아닌, 이해를 돕기 위해 재구성된 예제 코드입니다.

## 문제점

기존의 치트키 시스템이 if-else로만 이루어져있어 확장성에 문제가 생겼습니다.

```java
if(args[0].equalsIgnoreCase("/골드")) {
    // 골드 처리
} else if(args[0].equalsIgnoreCase("/루비")) {
    // 루비 처리
}
//...
```

하나의 함수에 모든 로직이 if-else로 뭉쳐져 있기 때문에 문제가 생겼을 때 추적하기 힘들고, 함수화 및 가독성에도 매우 좋지 않았습니다.

## 리팩토링 1단계: Command 패턴 적용

### CheatCode Enum

먼저 각 치트키의 메타데이터를 관리할 Enum을 정의합니다.

```java
public enum CheatCode {
    ECONOMY_GET_GOLD("골드", "골드를 획득한다"),
    ECONOMY_GET_RUBY("루비", "루비를 획득한다");

    private final String command;
    private final String description;
    
    CheatCode(String command, String description) {
        this.command = command;
        this.description = description;
    }
    
    public String getCommand() { return command; }
    public String getDescription() { return description; }
}
```

### CheatCommand 인터페이스

치트키 동작을 추상화할 인터페이스를 만듭니다.

```java
public interface CheatCommand {
    int execute(String[] args);
}
```

### 구현 클래스

각 치트키별로 클래스를 나누어 구현합니다. 이렇게 하면 로직 실행에 필요한 독립적인 함수를 생성하여 가독성을 크게 향상시킬 수 있습니다.

```java
public class EconomyGetGoldCheat implements CheatCommand {
    @Override
    public int execute(String[] args) {
        // 골드 획득 로직 구현
        return 0;
    }
}
```

### CheatManager

이들을 관리할 매니저 클래스입니다.

```java
import java.util.HashMap;
import java.util.Map;

public class CheatManager {
    private Map<String, CheatCommand> cheats = new HashMap<>();
    
    private void registerCommands(CheatCode code, CheatCommand command) {
        cheats.put(code.getCommand(), command);
    }
    
    private void initialize() {
        registerCommands(CheatCode.ECONOMY_GET_GOLD, new EconomyGetGoldCheat());
        registerCommands(CheatCode.ECONOMY_GET_RUBY, new EconomyGetRubyCheat());
    }
}
```

### 개선된 점

1. **가독성 향상**: 각 치트키별로 클래스를 나누어 로직이 분리되었습니다.
2. **명세 확인 용이**: Enum에 선언된 치트키 목록을 보며 현재 존재하는 치트키를 한눈에 확인할 수 있습니다.
3. **확장성**: 새롭게 생성되는 치트키의 제작이 간단해졌습니다.

## 리팩토링 2단계: 리플렉션을 이용한 자동 등록

하지만 이런 식으로 개발하다 보면 `registerCommands`를 할 때 실수로 잘못된 `CheatCode`와 잘못된 클래스를 매핑하는 경우가 생길 수도 있습니다.

이럴 땐 리플렉션 기능을 이용하여 자동화할 수 있습니다.

### 자동 등록 로직

예를 들어 `ECONOMY_GET_GOLD`라는 Enum 이름에서 `_`를 제거하고 CamelCase로 변환하여 `EconomyGetGold`를 만든 뒤, 뒤에 `Cheat`를 붙여 `EconomyGetGoldCheat`라는 클래스 이름이 존재하는지 찾습니다. 만약 존재한다면 그 클래스의 인스턴스를 생성하여 자동으로 매핑하는 방식입니다.

```java
public class CheatManager {
    private Map<String, CheatCommand> cheats = new HashMap<>();
    
    private void autoRegister() {
        for (CheatCode code : CheatCode.values()) {
            try {
                // Enum 이름을 클래스 이름으로 변환
                String className = convertToClassName(code.name());
                Class<?> clazz = Class.forName("com.example.cheats." + className);
                
                // CheatCommand 인터페이스를 구현하는지 확인
                if (CheatCommand.class.isAssignableFrom(clazz)) {
                    CheatCommand command = (CheatCommand) clazz.getDeclaredConstructor().newInstance();
                    cheats.put(code.getCommand(), command);
                }
            } catch (Exception e) {
                System.err.println("Failed to register: " + code.name());
            }
        }
    }
    
    private String convertToClassName(String enumName) {
        // ECONOMY_GET_GOLD -> EconomyGetGoldCheat
        String[] parts = enumName.split("_");
        StringBuilder className = new StringBuilder();
        
        for (String part : parts) {
            className.append(part.substring(0, 1).toUpperCase())
                     .append(part.substring(1).toLowerCase());
        }
        
        className.append("Cheat");
        return className.toString();
    }
}
```

이렇게 하면 매핑 실수를 방지하고, 클래스 생성만으로 치트키 등록이 완료되는 편리한 시스템을 구축할 수 있습니다.

## 리팩토링 3단계: 어노테이션 활용

리플렉션 기능을 이용하면 어노테이션 기능도 활용할 수 있습니다.

### CheatHandler 어노테이션

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface CheatHandler {
    CheatCode value();
}
```

### 어노테이션 적용

```java
@CheatHandler(CheatCode.ECONOMY_GET_GOLD)
public class EconomyGetGoldCheat implements CheatCommand {
    @Override
    public int execute(String[] args) {
        // 골드 획득 로직 구현
        return 0;
    }
}
```

각 클래스가 어떤 CheatCode로 동작할지 어노테이션을 미리 만들어두면 검색을 할 때에도 하나의 CheatCode만 검색하면 정의된 CheatCode와 어노테이션이 활용된 곳으로 이동할 수 있습니다.

### 어노테이션 기반 자동 등록

```java
public class CheatManager {
    private Map<String, CheatCommand> cheats = new HashMap<>();
    
    private void autoRegisterWithAnnotation() {
        // 패키지 내 모든 클래스 스캔
        Reflections reflections = new Reflections("com.example.cheats");
        Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(CheatHandler.class);
        
        for (Class<?> clazz : annotated) {
            try {
                CheatHandler annotation = clazz.getAnnotation(CheatHandler.class);
                CheatCode code = annotation.value();
                
                CheatCommand command = (CheatCommand) clazz.getDeclaredConstructor().newInstance();
                cheats.put(code.getCommand(), command);
            } catch (Exception e) {
                System.err.println("Failed to register: " + clazz.getName());
            }
        }
    }
}
```

## 결론

if-else 구조에서 시작하여 Command 패턴, 리플렉션, 어노테이션까지 단계적으로 리팩토링을 진행했습니다.

최종적으로 우리는 다음과 같은 코드를 얻었습니다.

### CheatCode.java

```java
public enum CheatCode {
    ECONOMY_GET_GOLD("골드", "골드를 획득한다"),
    ECONOMY_GET_RUBY("루비", "루비를 획득한다"),
    PLAYER_LEVEL_UP("레벨업", "플레이어 레벨을 올린다"),
    ITEM_SPAWN("아이템", "아이템을 생성한다");

    private final String command;
    private final String description;
    
    CheatCode(String command, String description) {
        this.command = command;
        this.description = description;
    }
    
    public String getCommand() { return command; }
    public String getDescription() { return description; }
}
```

### CheatCommand.java

```java
public interface CheatCommand {
    int execute(String[] args);
}
```

### CheatHandler.java

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface CheatHandler {
    CheatCode value();
}
```

### EconomyGetGoldCheat.java

```java
@CheatHandler(CheatCode.ECONOMY_GET_GOLD)
public class EconomyGetGoldCheat implements CheatCommand {
    @Override
    public int execute(String[] args) {
        int amount = args.length > 1 ? Integer.parseInt(args[1]) : 1000;
        // 골드 획득 로직
        System.out.println("골드 " + amount + "개를 획득했습니다.");
        return 0;
    }
}
```

### CheatManager.java

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.reflections.Reflections;

public class CheatManager {
    private Map<String, CheatCommand> cheats = new HashMap<>();
    
    public void initialize() {
        autoRegisterWithAnnotation();
    }
    
    private void autoRegisterWithAnnotation() {
        Reflections reflections = new Reflections("com.example.cheats");
        Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(CheatHandler.class);
        
        for (Class<?> clazz : annotated) {
            try {
                CheatHandler annotation = clazz.getAnnotation(CheatHandler.class);
                CheatCode code = annotation.value();
                
                CheatCommand command = (CheatCommand) clazz.getDeclaredConstructor().newInstance();
                cheats.put(code.getCommand(), command);
                
                System.out.println("Registered: " + code.getCommand());
            } catch (Exception e) {
                System.err.println("Failed to register: " + clazz.getName());
                e.printStackTrace();
            }
        }
    }
    
    public int executeCheat(String[] args) {
        if (args.length == 0) {
            System.out.println("사용 가능한 치트키:");
            cheats.keySet().forEach(System.out::println);
            return 0;
        }
        
        CheatCommand command = cheats.get(args[0]);
        if (command == null) {
            System.out.println("알 수 없는 치트키: " + args[0]);
            return -1;
        }
        
        return command.execute(args);
    }
}
```

이제 새로운 치트키를 추가하려면:

1. `CheatCode` Enum에 새로운 항목 추가
2. `@CheatHandler` 어노테이션을 사용한 구현 클래스 생성

단 두 단계만으로 자동으로 등록되고 사용할 수 있습니다!