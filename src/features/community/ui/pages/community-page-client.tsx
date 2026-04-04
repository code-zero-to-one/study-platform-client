'use client';

import PageContainer from '@/components/common/ui/page-container';
import { useCommunityPageController } from '@/features/community/model/use-community-page-controller';
import CommunityFeedSection from '../community-feed-section';
import CommunityHeroSection from '../community-hero-section';

export default function CommunityPageClient() {
  const { state, actions, viewModel } = useCommunityPageController();

  return (
    <PageContainer className="flex flex-col gap-500 xl:gap-600">
      <CommunityHeroSection discordUrl={viewModel.discordUrl} />

      <CommunityFeedSection
        activeFilter={state.activeFilter}
        activeView={state.activeView}
        filterOptions={viewModel.filterOptions}
        posts={viewModel.visiblePosts}
        onFilterChange={actions.handleFilterChange}
        onViewChange={actions.handleViewChange}
        viewOptions={viewModel.viewOptions}
      />
    </PageContainer>
  );
}
