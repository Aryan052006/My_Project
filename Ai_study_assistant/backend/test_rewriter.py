from query_rewriter import rewrite_question

history = [

    {
        "role":"user",
        "content":"Explain primary market and secondary market."
    },

    {
        "role":"assistant",
        "content":"..."
    }

]

print(

    rewrite_question(

        "List advantages for both.",

        history

    )

)