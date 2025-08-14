export type RootStackParamList = {
	index: undefined;
	vault: undefined;
	settings: undefined;
	"item/[id]": { id: string };
	"item/new": undefined;
};

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
