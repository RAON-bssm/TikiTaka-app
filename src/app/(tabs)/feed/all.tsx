import { useState } from 'react';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostFlatList } from '@/components/feed/PostList';
import BackButton from '@/components/ui/BackButton';
import { palette } from '@/constants/colors';
import { useAllPostsFeed } from '@/hooks/post/useAllPostsFeed';

const PAGE_SIZE = 20;

export default function AllPostsScreen() {
  const posts = useAllPostsFeed(PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await posts.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <PostFlatList
        state={posts}
        header={<BackButton title="전체 게시글" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={palette.primary[600]}
            colors={[palette.primary[600]]}
          />
        }
      />
    </SafeAreaView>
  );
}
