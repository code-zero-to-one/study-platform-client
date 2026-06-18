'use client';

import PageContainer from '@/components/common/ui/page-container';
import { useCommunityPageController } from '@/features/community/model/use-community-page-controller';
import CommunityFeedSection from '../community-feed-section';
import CommunityHeroSection from '../community-hero-section';

interface CommunityPageClientProps {
  initialPage: number;
}

export default function CommunityPageClient({
  initialPage,
}: CommunityPageClientProps) {
  const { state, actions, viewModel } = useCommunityPageController({
    initialPage,
  });

  return (
    <PageContainer className="flex flex-col gap-500 xl:gap-600">
      <CommunityHeroSection
        discordUrl={viewModel.discordUrl}
        writeHref={viewModel.writeHref}
        writeLabel={viewModel.writeLabel}
      />

      <CommunityFeedSection
        activeFilter={state.activeFilter}
        activeView={state.activeView}
        currentPage={state.currentPage}
        errorMessage={state.errorMessage}
        featuredPosts={viewModel.featuredPosts}
        filterOptions={viewModel.filterOptions}
        isLoading={state.isLoading}
        isQnaFilter={viewModel.isQnaFilter}
        onFilterChange={actions.handleFilterChange}
        onPageChange={actions.handlePageChange}
        onViewChange={actions.handleViewChange}
        postCount={viewModel.postCount}
        posts={viewModel.paginatedPosts}
        qnaQuestions={viewModel.qnaQuestions}
        showPagination={viewModel.showPagination}
        totalPages={viewModel.totalPages}
        viewOptions={viewModel.viewOptions}
      />
    </PageContainer>
  );
}
