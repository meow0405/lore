from lore.core.models import FileFeature, GraphEdge, GraphNode, GraphPayload


def build_graph(repo_id: str, features: list[FileFeature]) -> GraphPayload:
    nodes = [
        GraphNode(
            id=feature.file_path,
            label=feature.file_path,
            data={"danger": feature.danger_score, "label": feature.danger_label.value},
        )
        for feature in features
    ]
    edges: list[GraphEdge] = []
    for feature in features:
        for target, weight in feature.cochanged_files.items():
            if feature.file_path < target:
                edges.append(GraphEdge(source=feature.file_path, target=target, weight=weight))
    return GraphPayload(repo_id=repo_id, nodes=nodes, edges=edges)
