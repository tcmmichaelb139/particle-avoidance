<script lang="ts">
	import { browser } from '$app/environment';
	import { init, createScene, destroyScene } from '$lib/scene';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	import { Pane } from 'tweakpane';

	const SETTINGS = {
		affectingDistance: 15,
		avoidanceFactor: 20,
		lerpSpeed: 0.05,
		rotationSpeed: 0.0
	};

	let geometry = $state('');

	let numClicks = $state(0);
	let needDestroy = $state(false);

	function clickedGeometry(geo: string) {
		geometry = geo;
	}

	onMount(() => {
		init();

		const pane: any = new Pane();

		pane.addBinding(SETTINGS, 'affectingDistance', {
			min: 0,
			max: 50
		});

		pane.addBinding(SETTINGS, 'avoidanceFactor', {
			min: 0,
			max: 50
		});

		pane.addBinding(SETTINGS, 'lerpSpeed', {
			min: 0,
			max: 0.2
		});

		pane.addBinding(SETTINGS, 'rotationSpeed', {
			min: 0,
			max: 0.05
		});
	});

	$effect(() => {
		if (browser && geometry !== '' && !needDestroy) {
			createScene(geometry, SETTINGS);
			needDestroy = true;
		} else if (browser && geometry === '' && needDestroy) {
			destroyScene();
			numClicks++;
			needDestroy = false;
		}
	});
</script>

<svelte:head>
	<title>3d Mesh</title>
</svelte:head>

{#if geometry === ''}
	<main class="selection-screen" transition:slide={{ delay: 100, duration: 1000 }}>
		<!-- Create an animation for the a loading screen that fills up the whole page-->
		<h1>Select an Object</h1>

		<div class="selection-buttons">
			<button class="select-button" onclick={() => clickedGeometry('plane')}>Plane</button>
			<button class="select-button" onclick={() => clickedGeometry('sphere')}>Sphere</button>
			<button class="select-button" onclick={() => clickedGeometry('box')}>Box</button>
			<button class="select-button" onclick={() => clickedGeometry('torus')}>Torus</button>
			<button class="select-button" onclick={() => clickedGeometry('torus knot')}>Torus Knot</button
			>
		</div>
	</main>
{/if}

<nav class="navigation-bar">
	{#if geometry !== ''}
		<a href="/" onclick={() => clickedGeometry('')} aria-label="Link to GitHub">
			<div class="nav-link">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg
				>
			</div>
		</a>
	{/if}
	<a
		href="https://github.com/tcmmichaelb139/particle-avoidance"
		rel="noopener"
		aria-label="Link to GitHub"
	>
		<div class="nav-link">
			<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
				><title>GitHub</title><path
					d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
				/></svg
			>
		</div>
	</a>
</nav>

{#if numClicks >= 3 && geometry === ''}
	<footer class="footer-notes">
		<p>
			<b>Note:</b> Clicking back multiple times without reloading may slow down the program. Consider
			reloading.
		</p>
	</footer>
{/if}

<style>
	:root {
		/* tokyonight */
		--bg-color: #1a1b26;
		--bg-alt-color: #24283b;
		--fg-color: #a9b1d6;
		--gray-color: #565f89;
		--blue: #7aa2f7;
		--sky: #7dcfff;
		--violet: #bb9af7;
		--amber: #ff9e64;
		--lime: #9ece6a;
		--emerald: #73daca;

		/* tweakpane */
		--tp-base-background-color: hsla(230, 24%, 19%, 1);
		--tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
		--tp-button-background-color: hsla(229, 23%, 44%, 1);
		--tp-button-background-color-active: rgba(126, 135, 174, 1);
		--tp-button-background-color-focus: rgba(111, 121, 165, 1);
		--tp-button-background-color-hover: rgba(96, 107, 154, 1);
		--tp-button-foreground-color: hsla(230, 7%, 17%, 1);
		--tp-container-background-color: hsla(230, 7%, 75%, 0.1);
		--tp-container-background-color-active: hsla(230, 7%, 75%, 0.25);
		--tp-container-background-color-focus: hsla(230, 7%, 75%, 0.2);
		--tp-container-background-color-hover: hsla(230, 7%, 75%, 0.15);
		--tp-container-foreground-color: hsla(230, 7%, 75%, 1);
		--tp-groove-foreground-color: hsla(235, 19%, 13%, 1);
		--tp-input-background-color: hsla(230, 7%, 75%, 0.1);
		--tp-input-background-color-active: hsla(231, 7%, 60%, 0.1);
		--tp-input-background-color-focus: hsla(230, 7%, 65%, 0.1);
		--tp-input-background-color-hover: hsla(229, 7%, 70%, 0.1);
		--tp-input-foreground-color: hsla(229, 35%, 75%, 1);
		--tp-label-foreground-color: hsla(229, 35%, 75%, 1);
		--tp-monitor-background-color: hsla(230, 7%, 0%, 0.2);
		--tp-monitor-foreground-color: hsla(229, 23%, 44%, 1);
	}

	:global(body) {
		background-color: var(--bg-color);
		color: var(--fg-color);
		margin: 0;
		overflow: hidden;
	}

	:global(h1) {
		font-size: 3rem;
		color: var(--blue);
		text-shadow: 0 0 1rem var(--blue);
	}

	:global(svg) {
		width: 100%;
		height: 100%;
	}

	.selection-screen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: var(--bg-color);
		color: var(--fg-color);
		z-index: 100;
		transition: opacity 0.5s ease-in-out;
	}

	.selection-buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.select-button {
		font-size: 1rem;
		background-color: var(--bg-alt-color);
		color: var(--violet);
		padding: 1rem 1.5rem;
		margin: 1rem;
		border: 0.25rem solid var(--violet);
		filter: drop-shadow(0 0 0.25rem var(--violet));
		border-radius: 1rem;
		cursor: pointer;
		transition: filter 0.25s ease-in-out;
	}

	.select-button:hover,
	.select-button:focus {
		filter: drop-shadow(0 0 0.5rem var(--violet));
	}

	.navigation-bar {
		position: fixed;
		top: 2rem;
		left: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		background-color: var(--bg-alt-color);
		color: var(--fg-color);
		border-radius: 20rem;
		z-index: 101;
	}

	.nav-link {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		margin: 0.5rem;
		color: var(--sky);
		filter: drop-shadow(0 0 0.1rem var(--sky));
		transition: filter 0.25s ease-in-out;
	}

	.nav-link:hover,
	.nav-link:focus {
		filter: drop-shadow(0 0 0.25rem var(--sky));
	}

	.footer-notes {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		border-radius: 0.5rem;
		background-color: var(--bg-alt-color);
		border: 0.25rem solid var(--amber);
		filter: drop-shadow(0 0 0.5rem var(--amber));
		color: var(--fg-color);
		z-index: 101;
	}

	.footer-notes p {
		font-size: 0.85rem;
		margin: 1rem;
	}
</style>
