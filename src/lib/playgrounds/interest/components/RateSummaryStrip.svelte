<script lang="ts">
	import { t } from '$lib/i18n';
	import KpiStrip from '$lib/components/playground/KpiStrip.svelte';
	import type { KpiItem } from '$lib/components/playground/kpi-strip-types';
	import { fmtPct } from '$lib/format';

	let {
		nominal,
		eir,
		continuousEquivalent,
	}: {
		nominal: number;
		eir: number;
		continuousEquivalent: number;
	} = $props();

	let translate = $derived($t);

	let items: KpiItem[] = $derived([
		{ label: translate('int.rate.nominal.label'), value: fmtPct(nominal * 100, 3) },
		{
			label: translate('int.rate.effective.label'),
			value: fmtPct(eir * 100, 3),
			variant: 'accent' as const,
		},
		{
			label: translate('int.rate.continuous.label'),
			value: fmtPct(continuousEquivalent * 100, 3),
		},
	]);
</script>

<KpiStrip {items} />
