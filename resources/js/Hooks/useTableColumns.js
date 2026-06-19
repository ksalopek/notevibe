import { useState, useEffect } from 'react';

export default function useTableColumns(tableId, defaultColumns) {
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem(`table_columns_${tableId}`);
        return saved ? JSON.parse(saved) : defaultColumns.map(c => c.id);
    });

    useEffect(() => {
        localStorage.setItem(`table_columns_${tableId}`, JSON.stringify(visibleColumns));
    }, [visibleColumns, tableId]);

    const toggleColumn = (id) => {
        setVisibleColumns(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return { visibleColumns, toggleColumn };
}
