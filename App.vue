<template>
	<hello-world></hello-world>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import { mapGetters, mapMutations } from 'vuex';
export default {
	name: "App",
	components: {
		HelloWorld,
	},
	computed: mapGetters(['mode', 'isGameOver']),
	methods: {
		...mapMutations(['updateSquares', 'calculateWinner', 'toggleTurn', 'toggleGameOverOption']),
		onStorageUpdate(e) {
			if (e.key === 'history') {
				this.updateSquares();
				if (this.isGameOver) {
					this.toggleGameOverOption();
					return;
				}
				this.calculateWinner();
				this.toggleTurn();

			}
		}
	},
	created() {
		if (this.mode === 'multiplayer') {
			this.$store.dispatch('initMultiplayerMode')
		}
	},
	mounted() {
		window.addEventListener('storage', this.onStorageUpdate)
	}
};
</script>

<style lang="scss">
</style>
