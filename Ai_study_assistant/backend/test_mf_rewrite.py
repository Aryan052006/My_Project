from query_rewriter import rewrite_question

history = [
    {"role": "user", "content": "What are mutual funds"},
    {"role": "assistant", "content": "- Mutual funds are trusts that pool money from multiple investors..."}
]

question = "Explain advantages for same"
rewritten = rewrite_question(question, history)
print(f"REWRITTEN: '{rewritten}'")
