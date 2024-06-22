import { StyleSheet, Text, View } from "react-native";
import SamsaraWheel from "@/components/SamsaraWheel";
import Header from "./header";
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { Service } from "@/types";
import { services } from "@/constants/services";
import { LinearGradient } from "expo-linear-gradient";

export default function Page() {
	const end_period = new Date();
	end_period.setDate(end_period.getDate() + 20);
	const init_services: string[] = [
		"paramount",
		"hulu",
		"youtube",
		"apple",
		"roku",
		"netflix",
		"prime",
		"disney",
		"hbo",
	];

	const [selected_services, setSelected_services] = useState(init_services);
	const [selected_service_data, setSelected_service_data] = useState(
		services[init_services[0].toLowerCase()]
	);

	useEffect(() => {
		const serviceKey = selected_services[0].toLowerCase();
		const serviceData = services[serviceKey];
		if (serviceData) {
			setSelected_service_data(serviceData);
		}
	}, [selected_services]);

	return (
		<LinearGradient
			// Button Linear Gradient
			locations={[0.05, 0.7, 1]}
			colors={selected_service_data.colors.toReversed().slice(0, 3)}
			style={styles.container}>
			<Stack.Screen
				name=''
				options={{
					title: "test",
					header: () => <Header service_data={selected_service_data} />,
				}}
			/>
			<View style={styles.main}>
				{selected_services.length > 0 ? (
					<SamsaraWheel
						serviceUsestate={[selected_services, setSelected_services]}
						end_period={end_period}
					/>
				) : (
					<View>
						<Text>select a service down below</Text>
					</View>
				)}
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		padding: 24,
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
		fontSize: 36,
		color: "#38434D",
	},
});

const serviceStyles = StyleSheet.create({
	prime: {
		backgroundColor: "#CFE8FF",
	},
	disney: {
		backgroundColor: "#1B1F4A",
	},
	netflix: {
		backgroundColor: "#8B3C3C",
	},
	roku: {
		backgroundColor: "#6f1ab1",
	},
	hulu: {
		backgroundColor: "#1ce783",
	},
	hbo: {
		backgroundColor: "#000",
	},
	apple: {
		backgroundColor: "#000",
	},
	youtube: {
		backgroundColor: "#ff0000",
	},
});

// selected_service_data
// 					? {
// 							flex: 1,
// 							alignItems: "center",
// 							padding: 24,
// 							...serviceStyles[selected_services[0].toLowerCase()],
// 					  }
// 					: styles.container
