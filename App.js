import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import TrackPlayer, {
  useTrackPlayerEvents,
  useTrackPlayerProgress,
  TrackPlayerEvents,
  STATE_PLAYING,
} from "react-native-track-player";

track = {
  id: "1", // Must be a string, required
  url: "http://192.168.1.2:8000/streams/b14083b2c6fa4ea64e731640b54dbdb0.m3u8", // Load media from the network

  title: "Still Falls the Rain",
  artist: "AOA",
  type: "hls",

  // artwork: 'http://example.com/avaritia.png', // Load artwork from the network
};

export default function App() {
  const [playbackState, setState] = useState("");
  const [title, setTitle] = useState("");

  console.log(
    `Status codes: CONNECTING: ${TrackPlayer.STATE_CONNECTING}, BUFFERING: ${TrackPlayer.STATE_BUFFERING}, NONE: ${TrackPlayer.STATE_NONE}, PAUSED: ${TrackPlayer.STATE_PAUSED}, PLAYING: ${TrackPlayer.STATE_PLAYING}, READY: ${TrackPlayer.STATE_READY}, STOPPED: ${TrackPlayer.STATE_STOPPED}`
  );

  useTrackPlayerEvents(
    [
      TrackPlayerEvents.PLAYBACK_ERROR,
      TrackPlayerEvents.PLAYBACK_STATE,
      TrackPlayerEvents.PLAYBACK_TRACK_CHANGED,
    ],
    async (event) => {
      console.log("event", event);
      if (event.type === TrackPlayerEvents.PLAYBACK_ERROR) {
        console.warn(
          "An error occurred while playing the current track.",
          event
        );
      }
      if (event.type === TrackPlayerEvents.PLAYBACK_STATE) {
        setState(event.state);
      }

      if (event.type === TrackPlayerEvents.PLAYBACK_TRACK_CHANGED) {
        const trackId = await TrackPlayer.getCurrentTrack();
        const track = await TrackPlayer.getTrack(trackId);
        setTitle(track.title);
      }
    }
  );

  useEffect(() => {
    async function startPlayback() {
      try {
        await TrackPlayer.add([track]);
      } catch (error) {
        console.log("error: ", error);
      }
    }
    startPlayback();

    return () => {
      TrackPlayer.destroy();
    };
  }, []);

  onTogglePlayback = () => {
    if (playbackState === STATE_PLAYING) TrackPlayer.pause();
    else TrackPlayer.play();
  };

  onSeek = async () => {
    const duration = await TrackPlayer.getDuration();
    TrackPlayer.seekTo(duration / 2);
  };

  const { position, bufferedPosition, duration } = useTrackPlayerProgress();

  const isPlaying = playbackState === STATE_PLAYING;

  return (
    <View style={styles.container}>
      <Text>Title: {title}</Text>
      <Text>
        {isPlaying ? "Playing" : "Paused"}: {position}/{duration}
      </Text>
      <Text>Buffer: {bufferedPosition}</Text>
      <Button onPress={onTogglePlayback} title={isPlaying ? "Pause" : "Play"} />
      <Button onPress={onSeek} title="Seek to 50%" />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
