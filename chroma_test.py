
import chromadb

# Create a persistent local database
client = chromadb.PersistentClient(
    path="./chroma_data"
)

# Create a collection for repair reports
collection = client.get_or_create_collection(
    name="repair_history"
)

# Add example repair reports
collection.upsert(
    ids=["repair1", "repair2", "repair3"],
    documents=[
        "Car makes a rattling noise during acceleration.",
        "Engine oil and oil filter were replaced.",
        "Metallic vibration caused by a loose exhaust shield."
    ],
    metadatas=[
        {"vehicle": "KA01AB1234", "type": "engine_noise"},
        {"vehicle": "KA09CD5678", "type": "maintenance"},
        {"vehicle": "KA03EF9012", "type": "vibration"}
    ]
)

# Search for similar repair descriptions
results = collection.query(
    query_texts=[
        "My vehicle vibrates and makes a strange noise."
    ],
    n_results=2
)

print("Similar repair reports:")

for document in results["documents"][0]:
    print("-", document)
