// @ts-nocheck
import React, { useRef, forwardRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  TouchableOpacity
} from 'react-native';

const { width, height } = Dimensions.get('screen');

const images = {
  man: 'https://images.pexels.com/photos/3147528/pexels-photo-3147528.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  women: 'https://images.pexels.com/photos/2552130/pexels-photo-2552130.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  kids: 'https://images.pexels.com/photos/5080167/pexels-photo-5080167.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  skullcandy: 'https://images.pexels.com/photos/5602879/pexels-photo-5602879.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
};

const data = Object.keys(images).map((i) => ({
  key: i,
  title: i,
  image: images[i],
  ref: React.createRef() // This was added later
}));

const Tab = forwardRef(({ item, onItemPress }, ref) => {
  return (
    <TouchableOpacity onPress={onItemPress}>
      <View ref={ref}>
        <Text
          style={styles.tab}
        >
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  )
})

const Indicator = ({ measures, scrollX }) => {
  const inputRange = data.map((_, index) => index * width); // This is [0, width, width * 2, width * 3, and so on...]

  const indicatorWidth = scrollX.interpolate({
    inputRange,
    outputRange: measures.map((measure) => measure.width)
  });

  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: measures.map((measure) => measure.x)
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        height: 4,
        width: 100,
        backgroundColor: "white",
        bottom: -12,
        left: 0,
        width: indicatorWidth,
        transform: [{
          translateX
        }]
      }}
    />
  )
}

const Tabs = ({ data, scrollX, onItemPress }) => {
  const [measures, setMeasures] = useState([]);
  const containerRef = useRef();

  useEffect(() => {
    let m = [];

    data.forEach((item, i) => {
      item.ref.current.measureLayout(
        containerRef.current,
        (x, y, width, height) => {
          m.push({
            x,
            y,
            width,
            height
          });

          if (m.length === data.length) {
            setMeasures(m);
          }
        }
      )
    })
  }, [measures])

  return (
    <View style={{ position: "absolute", top: 100, width }}>
      <View
        ref={containerRef}
        style={{
          justifyContent: "space-evenly",
          flex: 1,
          flexDirection: "row",
        }}
      >
        {data.map((item, index) => {
          return (
            <Tab
              key={item.key}
              item={item}
              ref={item.ref}
              onItemPress={() => onItemPress(index)}
            />
          )
        })}
      </View>
      {measures.length > 0 && <Indicator measures={measures} scrollX={scrollX} />}
    </View>
  )
}

const App = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const ref = useRef();
  const onItemPress = useCallback(itemIndex => {
    ref?.current?.scrollToOffset({
      offset: itemIndex * width,
    })
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.FlatList
        ref={ref}
        data={data}
        keyExtractor={item => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => {
          return <View
            style={styles.item}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />
            <View style={[StyleSheet.absoluteFillObject,
            styles.containerView
            ]}>
            </View>
          </View>
        }}
      />
      <Tabs
        scrollX={scrollX}
        data={data}
        onItemPress={onItemPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    resizeMode: "cover"
  },
  item: {
    width,
    height
  },
  containerView: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tab: {
    color: "white",
    fontSize: 84 / data.length,
    fontWeight: "800",
    textTransform: "uppercase"
  }
});

export default App;
