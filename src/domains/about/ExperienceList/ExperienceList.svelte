<script lang="ts">
  import './ExperienceList.css';
  import Tile from '@ui/Tile/Tile.svelte';
  import { formatTitleTypography } from '@core/utils/text';
  import type { Locale } from '@core/content/types';
  import { getProfileContent } from '../profile';

  interface ExperienceRole {
    period: string;
    title: string;
    company: string;
    points: string[];
  }

  /**
   * Chronologie des expériences professionnelles (domaine `about`).
   * Compose la primitive `<Tile>` sans dépendance vers le domaine `work` (isolation inter-domaines stricte).
   */
  interface Props {
    /** Langue d'affichage (charge le parcours FR ou EN par défaut) */
    locale?: Locale;
    /** Surcharge optionnelle de la liste de postes */
    roles?: ExperienceRole[];
    class?: string;
  }

  let { locale = 'fr', roles, class: className = '' }: Props = $props();

  const items = $derived(roles ?? getProfileContent(locale).experience);
</script>

<!--
  @component
  Chronologie des expériences professionnelles (domaine `about`).
  Compose la primitive `<Tile>` sans aucune dépendance vers le domaine `work` (isolation inter-domaines garantie par `lint:arch`).
-->
<ol class={['experience-list', className]}>
  {#each items as role, i (`${role.period}-${role.company}`)}
    <li data-reveal style:--reveal-index={i}>
      <Tile accent={i === 0 ? 'primary' : 'none'}>
        <p class="tile__label">{role.period}</p>
        <h3 class="tile__title">{formatTitleTypography(role.title)}</h3>
        <p class="experience-list__company">{role.company}</p>
        <ul class="experience-list__points">
          {#each role.points as point (point)}
            <li>{point}</li>
          {/each}
        </ul>
      </Tile>
    </li>
  {/each}
</ol>
