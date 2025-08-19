import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Minus, Download, Edit3, Trash2, Save, X, RotateCcw, Move } from 'lucide-react';

const InteractiveMindmap = ({ 
  mindmapData, 
  onSave, 
  onDelete, 
  onMindmapChange,
  readOnly = false, 
  blogId = null 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isDragMode, setIsDragMode] = useState(false);

  // Initialize mindmap data
  useEffect(() => {
    if (mindmapData && mindmapData.data) {
      const data = typeof mindmapData.data === 'string' ? 
        JSON.parse(mindmapData.data) : mindmapData.data;
      setNodes(data.nodes || []);
      setConnections(data.connections || []);
    } else {
      // Create default center node if no data
      const centerNode = {
        id: 'center',
        text: 'Main Topic',
        x: 400,
        y: 300,
        type: 'center',
        color: '#3B82F6'
      };
      setNodes([centerNode]);
      setConnections([]);
    }
  }, [mindmapData]);

  // Notify parent component of mindmap changes (debounced)
  useEffect(() => {
    if (onMindmapChange && (nodes.length > 0 || connections.length > 0)) {
      // Use a timeout to debounce frequent updates
      const timeoutId = setTimeout(() => {
        const data = {
          data: {
            nodes,
            connections,
            metadata: {
              created: new Date().toISOString(),
              scale,
              offset
            }
          }
        };
        onMindmapChange(data);
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId);
    }
    // Intentionally excluding scale and offset from dependencies to avoid updates on pan/zoom
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, connections, onMindmapChange]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      setCtx(context);
      
      // Set canvas size
      const resizeCanvas = () => {
        const container = containerRef.current;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          // drawMindmap will be called by the useEffect below when ctx changes
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, []);

  // Drawing functions
  const drawNode = useCallback((node, isSelected = false) => {
    if (!ctx) return;

    const { x, y, text, type, color = '#3B82F6' } = node;
    const adjustedX = (x + offset.x) * scale;
    const adjustedY = (y + offset.y) * scale;
    const radius = type === 'center' ? 60 : 40;
    const adjustedRadius = radius * scale;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(adjustedX, adjustedY, adjustedRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? '#F59E0B' : color;
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#D97706' : '#1F2937';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Draw text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${Math.max(12, 14 * scale)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text if too long
    const maxWidth = adjustedRadius * 1.5;
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    const lineHeight = 16 * scale;
    const startY = adjustedY - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, adjustedX, startY + index * lineHeight);
    });
  }, [ctx, offset, scale]);

  const drawConnection = useCallback((connection) => {
    if (!ctx) return;

    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return;

    const fromX = (fromNode.x + offset.x) * scale;
    const fromY = (fromNode.y + offset.y) * scale;
    const toX = (toNode.x + offset.x) * scale;
    const toY = (toNode.y + offset.y) * scale;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  }, [ctx, nodes, offset, scale]);

  const drawMindmap = useCallback(() => {
    if (!ctx || !canvasRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw connections first (behind nodes)
    connections.forEach(drawConnection);

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNode && selectedNode.id === node.id;
      drawNode(node, isSelected);
    });
  }, [ctx, nodes, connections, selectedNode, drawNode, drawConnection]);

  // Redraw when data changes
  useEffect(() => {
    drawMindmap();
  }, [drawMindmap]);

  // Mouse event handlers
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale
    };
  };

  const findNodeAtPosition = (x, y) => {
    return nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      const radius = node.type === 'center' ? 60 : 40;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  };

  const handleMouseDown = (e) => {
    if (readOnly) return;

    const mousePos = getMousePos(e);
    const clickedNode = findNodeAtPosition(mousePos.x, mousePos.y);

    if (clickedNode) {
      setSelectedNode(clickedNode);
      if (isDragMode) {
        setIsDragging(true);
        setDragStart({ x: mousePos.x - clickedNode.x, y: mousePos.y - clickedNode.y });
      }
    } else {
      setSelectedNode(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    if (selectedNode && isDragMode) {
      // Drag node
      const mousePos = getMousePos(e);
      const newNodes = nodes.map(node => 
        node.id === selectedNode.id
          ? { ...node, x: mousePos.x - dragStart.x, y: mousePos.y - dragStart.y }
          : node
      );
      setNodes(newNodes);
    } else if (!selectedNode) {
      // Pan canvas
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, scale * delta));
    setScale(newScale);
  };

  // Node operations
  const addNode = () => {
    // Determine the parent node (selected node or center node as fallback)
    const parentNode = selectedNode || nodes.find(n => n.type === 'center');
    
    if (!parentNode) return; // No parent node available
    
    // Calculate position relative to parent node
    const angle = Math.random() * 2 * Math.PI; // Random angle
    const distance = 120; // Distance from parent
    const newX = parentNode.x + Math.cos(angle) * distance;
    const newY = parentNode.y + Math.sin(angle) * distance;
    
    const newNode = {
      id: `node_${Date.now()}`,
      text: 'New Node',
      x: newX,
      y: newY,
      type: 'branch',
      color: '#10B981'
    };

    setNodes([...nodes, newNode]);

    // Connect to the parent node (selected node or center node)
    const newConnection = {
      from: parentNode.id,
      to: newNode.id
    };
    setConnections([...connections, newConnection]);
  };

  const deleteNode = () => {
    if (!selectedNode || selectedNode.type === 'center') return;

    setNodes(nodes.filter(n => n.id !== selectedNode.id));
    setConnections(connections.filter(c => 
      c.from !== selectedNode.id && c.to !== selectedNode.id
    ));
    setSelectedNode(null);
  };

  const startEditing = () => {
    if (!selectedNode) return;
    setIsEditing(true);
    setEditText(selectedNode.text);
  };

  const saveEdit = () => {
    if (!selectedNode || !editText.trim()) return;

    const newNodes = nodes.map(node => 
      node.id === selectedNode.id
        ? { ...node, text: editText.trim() }
        : node
    );
    setNodes(newNodes);
    setIsEditing(false);
    setEditText('');
    setSelectedNode({ ...selectedNode, text: editText.trim() });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const exportMindmap = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `mindmap_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const saveMindmap = () => {
    const data = {
      nodes,
      connections,
      metadata: {
        created: new Date().toISOString(),
        scale,
        offset
      }
    };

    if (onSave) {
      onSave(data);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="bg-gray-50 border-b px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addNode}
              disabled={!selectedNode && !nodes.find(n => n.type === 'center')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors text-sm"
              title={selectedNode ? `Add child to "${selectedNode.text}"` : 'Add child to Main Topic'}
            >
              <Plus size={16} />
              {selectedNode ? `Add to "${selectedNode.text.length > 10 ? selectedNode.text.substring(0, 10) + '...' : selectedNode.text}"` : 'Add Node'}
            </button>
            
            <button
              type="button"
              onClick={startEditing}
              disabled={!selectedNode}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 transition-colors text-sm"
            >
              <Edit3 size={16} />
              Edit
            </button>
            
            <button
              type="button"
              onClick={deleteNode}
              disabled={!selectedNode || selectedNode?.type === 'center'}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 transition-colors text-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>

            <button
              type="button"
              onClick={() => setIsDragMode(!isDragMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                isDragMode ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Move size={16} />
              {isDragMode ? 'Exit Drag' : 'Drag Mode'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScale(Math.min(3, scale * 1.1))}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              <Plus size={16} />
            </button>
            
            <span className="px-3 py-2 bg-gray-100 rounded-md text-sm font-mono">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              type="button"
              onClick={() => setScale(Math.max(0.1, scale * 0.9))}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              <Minus size={16} />
            </button>

            <button
              type="button"
              onClick={resetView}
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              onClick={exportMindmap}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
            >
              <Download size={16} />
              Export
            </button>

            <button
              type="button"
              onClick={saveMindmap}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors text-sm"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Node</h3>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter node text..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative"
        style={{ height: readOnly ? '400px' : '600px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-crosshair"
        />

        {/* Instructions */}
        {!readOnly && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Instructions:</p>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• Click a node to select it</li>
              <li>• Use toolbar to add/edit/delete nodes</li>
              <li>• Mouse wheel to zoom in/out</li>
              <li>• Drag empty space to pan</li>
              <li>• Enable drag mode to move nodes</li>
            </ul>
          </div>
        )}

        {/* Node Info */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg text-sm max-w-48">
            <p className="font-semibold">Selected Node:</p>
            <p className="text-gray-600 break-words">{selectedNode.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              Type: {selectedNode.type} | ID: {selectedNode.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMindmap;
