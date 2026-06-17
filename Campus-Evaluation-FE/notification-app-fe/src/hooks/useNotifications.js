import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, getPrioritySortedNotifications } from "../api/notifications";
import { Log } from "../api/logger"; // Importing your middleware function safely

// Custom debug key prefix for state inspection
const READ_REGISTRY_KEY = "campus_alerts_read_v1";

export function useNotifications() {
  // Main data payloads states
  const [rawItems, setRawItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  
  // Interface pipeline trackers
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [syncFailureMessage, setSyncFailureMessage] = useState(null);

  // Local state tracking for Read/Unread notification IDs
  const [viewedNotificationIds, setViewedNotificationIds] = useState(() => {
    try {
      const archivedLogs = localStorage.getItem(READ_REGISTRY_KEY);
      return archivedLogs ? JSON.parse(archivedLogs) : [];
    } catch (fsException) {
      return [];
    }
  });

  /**
   * Primary orchestrator function to handle network operations.
   */
  const executeDataSync = useCallback(async (targetPage, activeFilter, activeLimit) => {
    setIsDataSyncing(true);
    setSyncFailureMessage(null);
    
    // 🪵 Log the tracking lifecycle start as requested by the constraints
    await Log("frontend", "info", "hook", `Initiating data sync stream for page ${targetPage}`);
    
    try {
      const responseFeed = await fetchNotifications({
        page: targetPage,
        limit: activeLimit,
        notification_type: activeFilter
      });

      if (Array.isArray(responseFeed)) {
        setRawItems(responseFeed);
        // 🪵 Log successful data state integration
        await Log("frontend", "info", "state", `Successfully rendered and indexed ${responseFeed.length} items into view engine`);
      } else {
        setRawItems([]);
        // 🪵 Log unexpected payload shape variants
        await Log("frontend", "warn", "utils", "Received unexpected non-array format from underlying API source");
      }
    } catch (runtimeError) {
      setSyncFailureMessage(runtimeError.message || "Failed to load notification stream.");
      // 🪵 Log network / transmission errors exactly matching specifications
      await Log("frontend", "error", "api", `Data transmission network failure: ${runtimeError.message || "Unknown Error"}`);
    } finally {
      setIsDataSyncing(false);
    }
  }, []);

  // Synchronize component views to respond instantly on criteria shifts
  useEffect(() => {
    executeDataSync(currentPage, categoryFilter, pageSize);
  }, [currentPage, categoryFilter, pageSize, executeDataSync]);

  /**
   * Action trigger: Sets a notification's state to 'Read' locally
   */
  const commitItemAsViewed = useCallback((notificationId) => {
    if (!notificationId) return;
    
    setViewedNotificationIds((prevRegistry) => {
      if (prevRegistry.includes(notificationId)) return prevRegistry;
      const updatedRegistry = [...prevRegistry, notificationId];
      
      try {
        localStorage.setItem(READ_REGISTRY_KEY, JSON.stringify(updatedRegistry));
      } catch (ioError) {
        // Safe context block
      }
      
      return updatedRegistry;
    });
  }, []);

  /**
   * Action trigger: Resets all read status states back to unread
   */
  const clearReadHistoryLocal = useCallback(() => {
    try {
      localStorage.removeItem(READ_REGISTRY_KEY);
      setViewedNotificationIds([]);
    } catch (err) {
      // Safe context block
    }
  }, []);

  // Algorithmic compute properties for Stage 1 & Stage 2 requirements
  const prioritizedOutputFeed = getPrioritySortedNotifications(rawItems);

  // Manual fallback calculation for total count mapping
  const syntheticTotalCount = rawItems.length < pageSize && currentPage === 1 
    ? rawItems.length 
    : 50; 

  const computedTotalPages = Math.ceil(syntheticTotalCount / pageSize);

  return {
    notifications: rawItems,                
    priorityFeed: prioritizedOutputFeed,    
    viewedIds: viewedNotificationIds,       
    
    activePage: currentPage,
    activeFilter: categoryFilter,
    itemsLimit: pageSize,
    statusLoading: isDataSyncing,
    errorMessage: syncFailureMessage,
    totalPagesCount: computedTotalPages || 1,

    setPagePointer: setCurrentPage,
    setFilterCriteria: setCategoryFilter,
    setPageLimitSize: setPageSize,
    markAsRead: commitItemAsViewed,
    resetReadCache: clearReadHistoryLocal,
    refreshFeedManual: () => executeDataSync(currentPage, categoryFilter, pageSize)
  };
}