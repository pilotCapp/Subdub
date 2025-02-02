import { StyleSheet, Text, View } from "react-native";
import SubdubWheel from "@/components/SubdubWheel";
import Header from "./header";
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { Service } from "@/types";
import { services } from "@/constants/services";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import DragMenu from "@/components/DragMenu";
import HelpButton from "@/components/Help";
import registerBackgroundFetchAsync from "@/scripts/background";
console.log("background fetch import", registerBackgroundFetchAsync);

SplashScreen.preventAutoHideAsync();

import {
	alterPushNotifications,
	registerForPushNotificationsAsync,
	schedulePushNotification,
	cancelAllScheduledNotifications,
	getNotificationPermissions,
} from "@/scripts/notifications";
import { useFonts } from "expo-font";

export default function Page() {
	const fileUri = FileSystem.documentDirectory + "state.json";

	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	const [end_period, setEnd_period] = useState(() => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 30);
		return futureDate;
	});

	const init_services: string[] = ["init"];
	const [endAngle, setEndAngle] = useState(0);
	const [selected_services, setSelected_services] =
		useState<string[]>(init_services);
	const [selected_service_data, setSelected_service_data] = useState<
		Service[] | null
	>([services["init"], services["init"]]);

	const [addServiceVisual, setAddServiceVisual] = useState(false);

	const [notifications, setNotifications] = useState(false);
	const [notificationPermission, setNotificationPermission] =
		useState<boolean>(false);
	const [notificationDates, setNotificationDates] = useState<Date[]>([]);

	useEffect(() => {
		loadStateFromFile();
		setLoaded(true);
	}, []);

	async function initializeNotifications() {
		const status = await registerForPushNotificationsAsync();
		console.log("notifications initialized with status", status);
		if (status != "granted") {
			setNotificationPermission(false);
		} else {
			setNotificationPermission(true);
		}
		return status;
	}

	useEffect(() => {
		if (notifications && !notificationPermission) {
			const getPermission = async () => {
				const status = await initializeNotifications();
				if (status != "granted") {
					alert(
						"Please enable notifications in your settings and restart the app to receive notifications"
					);
					setNotifications(false);
				}
			};
			getPermission();
		} else if (
			!selected_services.includes(init_services[0]) &&
			notificationPermission
		) {
			const newState = {
				end_period: end_period, // Use current date for initial state
				selected_services: selected_services,
				notifications: notifications,
			};
			saveStateToFile(newState);
			if (notifications && notificationPermission) {
				if (selected_services.length > 1) {
					alterPushNotifications(
						end_period,
						selected_services[0],
						selected_services[1]
					);
				} else if (selected_services.length == 1) {
					alterPushNotifications(
						end_period,
						selected_services[0],
						selected_services[0]
					);
				} else {
					cancelAllScheduledNotifications();
				}
			} else {
				cancelAllScheduledNotifications();
			}
		}
	}, [notifications, notificationPermission]);

	useEffect(() => {
		if (selected_services.length > 1) {
			const selectedServiceKey = selected_services[0].toLowerCase();
			const nextServiceKey = selected_services[1].toLowerCase();
			const serviceData = [
				services[selectedServiceKey],
				services[nextServiceKey],
			];
			setSelected_service_data(serviceData);
		} else if (selected_services.length == 1) {
			const selectedServiceKey = selected_services[0].toLowerCase();
			const nextServiceKey = selected_services[0].toLowerCase();
			const serviceData = [
				services[selectedServiceKey],
				services[nextServiceKey],
			];
			setSelected_service_data(serviceData);
		} else {
			setSelected_service_data([services["none"], services["none"]]);
		}

		if (!selected_services.includes(init_services[0])) {
			const newState = {
				end_period: end_period, // Use current date for initial state
				selected_services: selected_services,
				notifications: notifications,
			};
			if (notifications && notificationPermission) {
				if (selected_services.length > 1) {
					alterPushNotifications(
						end_period,
						selected_services[0],
						selected_services[1]
					);
				} else if (selected_services.length == 1) {
					alterPushNotifications(
						end_period,
						selected_services[0],
						selected_services[0]
					);
				} else {
					cancelAllScheduledNotifications();
				}
			}

			saveStateToFile(newState);
		}
	}, [selected_services]);

	useEffect(() => {
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		const timedifference = end_period.getTime() - today.getTime();
		if (timedifference < 0 || timedifference > 32 * (1000 * 60 * 60 * 24)) {
			setEnd_period(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
			console.log("date is invalid, resetting to 30 days from now");
		} else if (!selected_services.includes(init_services[0])) {
			const newState = {
				end_period: end_period, // Use current date for initial state
				selected_services: selected_services,
				notifications: notifications,
			};

			if (notifications && notificationPermission) {
				if (selected_services.length > 1) {
					alterPushNotifications(
						end_period,
						selected_services[0],
						selected_services[1]
					);
				} else if (selected_services.length == 1) {
					alterPushNotifications(
						end_period,
						selected_services[0],
						selected_services[0]
					);
				} else {
					cancelAllScheduledNotifications();
				}
			}

			saveStateToFile(newState);
		}
	}, [end_period]);

	const saveStateToFile = async (state) => {
		try {
			const stateJson = JSON.stringify(state);
			await FileSystem.writeAsStringAsync(fileUri, stateJson);
		} catch (error) {
			console.error("Error saving state:", error);
		}
	};

	const loadStateFromFile = async () => {
		try {
			const fileInfo = await FileSystem.getInfoAsync(fileUri);
			if (!fileInfo.exists) {
				console.log("File does not exist, creating with default values.");
				const notifications = true;

				const currentDate = new Date();

				const futureDate = new Date();
				futureDate.setDate(currentDate.getDate() + 30);
				futureDate.setHours(23, 59, 59, 999);

				const defaultState = {
					end_period: futureDate, // Use current date for initial state
					selected_services: [],
					notifications: notifications,
				};

				saveStateToFile(defaultState); // Create the file with default values

				setEnd_period(new Date(defaultState.end_period));
				setSelected_services(defaultState.selected_services);
				setNotifications(defaultState.notifications);

				return;
			}

			const stateJson = await FileSystem.readAsStringAsync(fileUri);
			const state = JSON.parse(stateJson);

			// Convert string back to Date object
			if (state.end_period) {
				const endPeriod = new Date(state.end_period);
				const now = new Date();
				if (endPeriod < now) {
					console.log("End period reached, resetting state");
					const monthsDiff = Math.ceil(
						(now.getTime() - endPeriod.getTime()) / (1000 * 60 * 60 * 24 * 30)
					);
					console.log("montsDiff", monthsDiff);
					const new_period = new Date(
						endPeriod.setMonth(endPeriod.getMonth() + monthsDiff)
					);
					new_period.setHours(23, 59, 59, 999);

					let new_services;
					if (state.selected_services) {
						new_services = state.selected_services;
					} else {
						new_services = [];
					}
					if (new_services.length > 1) {
						for (let i = 0; i < monthsDiff; i++) {
							const firstElement = new_services.shift();
							if (firstElement != undefined) {
								new_services.push(firstElement);
							}
						}
					}
					setEnd_period(new_period);
					setSelected_services(new_services);
					setNotifications(true);
					return;
				} else {
					setEnd_period(new Date(state.end_period));
				}
			} else {
				setEnd_period(new Date());
				throw new Error("End period not found in state");
			}
			if (state.selected_services) {
				setSelected_services(state.selected_services);
			} else {
				setSelected_services(init_services);
				throw new Error("Selected services not found in state");
			}
			if (typeof state.notifications !== "undefined") {
				setNotifications(state.notifications);
			} else {
				setNotifications(true);
				console.log("notifications not found in state, setting to true");
			}
		} catch (error) {
			console.error("Error loading state:", error);
		}
	};

	return (
		<View style={{ height: "100%", width: "100%" }}>
			{/* Your always-rendered component goes here */}
			{selected_services.length > 0 && selected_service_data ? (
				<LinearGradient
					// Button Linear Gradient
					locations={[0.05, 0.7, 1]}
					colors={selected_service_data[0].colors.slice(0, 3).reverse()} // Fixed reverse method
					style={styles.container}>
					<Stack.Screen
						name=''
						options={{
							title: "main_header",
							header: () =>
								selected_services.length > 0 ? (
									<Header
										service_data={selected_service_data[0]}
										period_usestate={[end_period, setEnd_period]}
										notification_usestate={[notifications, setNotifications]}
									/>
								) : (
									<View />
								),
						}}
					/>
					<View style={styles.main}>
						<SubdubWheel
							serviceUsestate={[selected_services, setSelected_services]}
							centerUsestate={[addServiceVisual, setAddServiceVisual]}
							periodUsestate={[end_period, setEnd_period]}
							angleUsestate={[endAngle, setEndAngle]}
						/>
					</View>
					<View
						style={{
							position: "absolute",
							width: "100%",
							alignItems: "flex-end",
						}}>
						<View
							style={{
								alignItems: "flex-start",
							}}>
							<Text
								style={{
									color: "white",
									opacity: 0.8,
									fontSize: 12,
									margin: 5,
								}}>
								upcoming:
							</Text>
							<View
								style={{
									width: "25%",
									aspectRatio: 2,
									backgroundColor: selected_service_data[1].colors[0],
									borderRadius: 10,
									borderColor: "white",
									borderWidth: 1,
									alignSelf: "flex-end",
									padding: 10,
									marginRight: 15,
									shadowOffset: {
										width: 0,
										height: 3,
									},
									shadowOpacity: 0.5,
									shadowRadius: 5,
									elevation: 3,
								}}>
								<Image
									source={selected_service_data[1].image}
									style={{ height: "100%", width: "100%" }}
									contentFit={"contain"}
								/>
							</View>
						</View>
					</View>
				</LinearGradient>
			) : (
				<View
					style={{
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#E5E4E2",
						flex: 1,
					}}>
					<Stack.Screen
						options={{
							title: "null_header",
							header: () => (
								<View style={styles.no_services_header}>
									<Text
										style={styles.subtitle}
										adjustsFontSizeToFit={true}
										minimumFontScale={0.1}
										maxFontSizeMultiplier={1}
										numberOfLines={1}>
										Please add some services below
									</Text>
								</View>
							),
						}}
					/>
				</View>
			)}
			<DragMenu
				serviceUsestate={[selected_services, setSelected_services]}
				centerUsestate={[addServiceVisual, setAddServiceVisual]}
				angleUsestate={[endAngle, setEndAngle]}
			/>
			<HelpButton></HelpButton>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
	},
	main: {
		flex: 1,
		justifyContent: "center",
		maxWidth: 960,
		marginHorizontal: "auto",
	},
	title: {
		fontSize: 64,
		fontWeight: "bold",
	},
	subtitle: {
		fontSize: 46,
		fontWeight: "bold",
		shadowOpacity: 0.5,
		shadowRadius: 5,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		opacity: 0.8,
	},
	no_services_header: {
		alignItems: "center",
		justifyContent: "flex-end",
		padding: 25,
		backgroundColor: "white",
		top: 0,
		left: 0,
		height: 150,
		width: "100%",
		position: "absolute",
		borderRadius: 10,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.5,
		shadowRadius: 5,
	},
});
